export interface Appointment {
  staffId: string
  userId: string
  appointmentId: string
  createdAt: string
  username: string
  dueDatetime: string
  done: boolean
  attachmentUrl?: string
}
