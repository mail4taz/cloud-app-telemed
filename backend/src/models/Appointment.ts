export interface Appointment {
  staffId: string
  userId: string
  dueDatetime: number
  createdAt: string
  username: string
  done: boolean
  attachmentsURL?: string[]
}