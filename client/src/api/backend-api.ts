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
  console.log('Create appointment:', newAppointment)
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
  appDateTimeId: number,
  updatedAppointment: UpdateAppointmentRequest
): Promise<void> {
  await Axios.patch(`${apiEndpoint}/appointments/${appDateTimeId}`, JSON.stringify(updatedAppointment), {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${idToken}`
    }
  })
}

export async function deleteAppointment(
  idToken: string,
  appDateTimeId: number
): Promise<void> {
  await Axios.delete(`${apiEndpoint}/appointments/${appDateTimeId}`, {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${idToken}`
    }
  })
}

export async function getUploadUrl(
  idToken: string,
  appDateTimeId: number,
  filename: string
): Promise<string> {
  const encodedFilename = encodeURI(filename)
  const response = await Axios.post(`${apiEndpoint}/appointments/${appDateTimeId}/attachment/${encodedFilename}`, '', {
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
