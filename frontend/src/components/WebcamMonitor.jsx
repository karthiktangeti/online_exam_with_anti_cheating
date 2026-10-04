import { useEffect, useRef, useState } from 'react'; import { Camera, CameraOff } from 'lucide-react';
import { FilesetResolver, FaceLandmarker, ObjectDetector } from '@mediapipe/tasks-vision';
const WASM = 'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.14/wasm';
const FACE = 'https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task';
const OBJ = 'https://storage.googleapis.com/mediapipe-models/object_detector/efficientdet_lite0/float16/1/efficientdet_lite0.tflite';
// All analysis runs locally in the browser. No video is recorded or uploaded; only event types are sent.
// Thresholds (tune here): YAW 0.35/0.65, PITCH 0.62, "need" = consecutive checks (~0.7s each) before an event fires.
export default function WebcamMonitor({ report, active = true }) {
  const v = useRef(); const [state, setState] = useState('starting'); const [ai, setAi] = useState(null);
  useEffect(() => {
    let stream, timer, stop = false, busy = false, fl, od;
    const c = { no: 0, multi: 0, away: 0, phone: 0 }, f = { no: false, multi: false, away: false, phone: false };
    const check = (k, on, need, type, meta) => { if (on) { if (++c[k] >= need && !f[k]) { f[k] = true; report(type, meta); } } else { c[k] = 0; f[k] = false; } };
    const analyse = (faces, objs) => {
      check('no', faces.length === 0, 7, 'NO_FACE_DETECTED', { faces: 0 });
      check('multi', faces.length > 1, 3, 'MULTIPLE_FACES_DETECTED', { faces: faces.length });
      let away = null;
      if (faces.length === 1) {
        const p = faces[0], L = p[33], R = p[263], N = p[1], C = p[152];
        const yaw = (N.x - L.x) / (R.x - L.x), ey = (L.y + R.y) / 2, pitch = (N.y - ey) / (C.y - ey);
        away = yaw < 0.35 ? 'right' : yaw > 0.65 ? 'left' : pitch > 0.62 ? 'down' : null;
      }
      check('away', !!away, 4, away === 'left' ? 'HEAD_TURN_LEFT' : away === 'right' ? 'HEAD_TURN_RIGHT' : 'LOOKING_DOWN', { direction: away });
      check('phone', objs.some(d => d.categories[0]?.categoryName === 'cell phone'), 2, 'PHONE_DETECTED', { model: 'efficientdet_lite0' });
    };
    (async () => {
      try {
        stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
        if (stop) return stream.getTracks().forEach(t => t.stop());
        v.current.srcObject = stream; setState('on');
        stream.getVideoTracks()[0].onended = () => { setState('off'); report('CAMERA_DISABLED'); };
      } catch { setState('error'); report('CAMERA_DISABLED'); return; }
      try {
        const fs = await FilesetResolver.forVisionTasks(WASM);
        [fl, od] = await Promise.all([
          FaceLandmarker.createFromOptions(fs, { baseOptions: { modelAssetPath: FACE }, runningMode: 'VIDEO', numFaces: 3 }),
          ObjectDetector.createFromOptions(fs, { baseOptions: { modelAssetPath: OBJ }, runningMode: 'VIDEO', scoreThreshold: 0.45, maxResults: 6 })]);
        if (stop) return; setAi(true);
        timer = setInterval(() => {
          if (busy || !v.current || v.current.readyState < 2) return; busy = true;
          try { const t = performance.now(); analyse(fl.detectForVideo(v.current, t).faceLandmarks, od.detectForVideo(v.current, t).detections); } catch (e) { console.warn(e); }
          busy = false;
        }, 700);
      } catch (e) { console.warn('Detection models failed to load (internet needed)', e); setAi(false); }
    })();
    return () => { stop = true; clearInterval(timer); fl?.close(); od?.close(); stream?.getTracks().forEach(t => t.stop()); };
  }, [report]);
  const txt = state === 'error' ? 'Camera error' : state === 'off' ? 'Camera disabled' : ai === null ? 'Loading AI…' : ai ? 'Camera active · AI monitoring' : 'Camera active · preview only';
  return <div className="fixed bottom-4 right-4 w-40 bg-black rounded-lg overflow-hidden shadow-xl border-2 border-indigo-500 z-40">
    <video ref={v} autoPlay muted playsInline className="w-full h-28 object-cover" />
    <div className="text-[10px] text-white px-2 py-1 flex items-center gap-1 bg-slate-800">{state === 'off' ? <CameraOff size={11} /> : <Camera size={11} />}{txt}</div></div>;
}
