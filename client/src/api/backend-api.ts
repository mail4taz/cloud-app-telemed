import { apiEndpoint } from '../config'
import { Appointment } from '../types/Appointment';
import { Staff } from '../types/Staff';
import { CreateAppointmentRequest } from '../types/CreateAppointmentRequest';
import { UpdateAppointmentRequest } from '../types/UpdateAppointmentRequest';

import Axios from 'axios'

export async function getStaff(): Promise<Staff[]> {
  console.log('Fetching staff')

  const response = await Axios.get(`${apiEndpoint}/staff`, {
    headers: {
      'Content-Type': 'application/json',
    },
  })
  console.log('Staff:', response.data)
  return response.data.items
}

export async function getAppointments(idToken: string): Promise<Appointment[]> {
  console.log('Fetching user appointments')

  const response = await Axios.get(`${apiEndpoint}/appointments`, {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${idToken}`
    },
  })
  console.log('Appointments:', response.data)
  return response.data.items
}

export async function createAppointment(
  idToken: string,
  newAppointment: CreateAppointmentRequest
): Promise<Appointment> {
  const response = await Axios.post(`${apiEndpoint}/appointments`,  JSON.stringify(newAppointment), {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${idToken}`
    }
  })
  return response.data.item
}

export async function patchAppointment(
  idToken: string,
  appointmentId: string,
  updatedAppointment: UpdateAppointmentRequest
): Promise<void> {
  await Axios.patch(`${apiEndpoint}/appointments/${appointmentId}`, JSON.stringify(updatedAppointment), {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${idToken}`
    }
  })
}

export async function deleteAppointment(
  idToken: string,
  appointmentId: string
): Promise<void> {
  await Axios.delete(`${apiEndpoint}/appointments/${appointmentId}`, {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${idToken}`
    }
  })
}

export async function getUploadUrl(
  idToken: string,
  appointmentId: string
): Promise<string> {
  const response = await Axios.post(`${apiEndpoint}/Appointments/${appointmentId}/attachment`, '', {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${idToken}`
    }
  })
  return response.data.uploadUrl
}

export async function uploadFile(uploadUrl: string, file: Buffer): Promise<void> {
  await Axios.put(uploadUrl, file)
}
