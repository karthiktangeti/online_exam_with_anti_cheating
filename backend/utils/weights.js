// Configurable incident weights. Override with env INCIDENT_WEIGHTS='{"TAB_SWITCH":2}'
export const WEIGHTS = {
  TAB_SWITCH: 1, FULLSCREEN_EXIT: 2, COPY_ATTEMPT: 1, PASTE_ATTEMPT: 1, CUT_ATTEMPT: 1, RIGHT_CLICK: 1, KEYBOARD_SHORTCUT: 1,
  MULTIPLE_SESSION: 3, NO_FACE: 2, NO_FACE_DETECTED: 2, MULTIPLE_FACES: 4, MULTIPLE_FACES_DETECTED: 4,
  LOOKING_AWAY: 1, HEAD_TURN_LEFT: 1, HEAD_TURN_RIGHT: 1, LOOKING_DOWN: 1, PHONE_DETECTED: 5, CAMERA_DISABLED: 3,
  EXAM_STARTED: 0, EXAM_SUBMITTED: 0, ...JSON.parse(process.env.INCIDENT_WEIGHTS || '{}'),
};
export const EVENT_TYPES = Object.keys(WEIGHTS);
export const CLIENT_EVENTS = EVENT_TYPES.filter(t => !t.startsWith('EXAM_') && t !== 'MULTIPLE_SESSION');
export const riskLevel = s => (s < 3 ? 'Normal Activity' : s < 8 ? 'Review Recommended' : 'Multiple Incidents');
