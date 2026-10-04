let io;

export const ADMIN_ROOM = 'admins';

export function setIO(instance) {
  io = instance;
  return io;
}

export function getIO() {
  return io;
}

export function emitToAdmins(event, payload) {
  try {
    io?.to(ADMIN_ROOM).emit(event, payload);
  } catch (error) {
    console.error(`Socket emit failed (${event}):`, error.message);
  }
}
