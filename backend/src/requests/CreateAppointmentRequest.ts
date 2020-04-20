/**
 * Fields in a request to create a single Appointment item.
 */
export interface CreateAppointmentRequest {
  staffId: string,
  name: string,
  dueDatetime: string
}
