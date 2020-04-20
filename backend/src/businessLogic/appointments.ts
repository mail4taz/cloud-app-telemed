import * as uuid from 'uuid'

import { StaffDao } from "../dao/staffDao"
import { AppointmentsDao } from "../dao/appointmentsDao"
import { Staff } from "../models/Staff";
import { Appointment } from "../models/Appointment";
import { CreateAppointmentRequest } from "../requests/CreateAppointmentRequest";
import { UpdateAppointmentRequest } from "../requests/UpdateAppointmentRequest";

const appointmentsDao = new AppointmentsDao
const staffDao = new StaffDao

export async function getAvailableAppointmentsByUser(userId: string): Promise<Appointment[]> {
    return appointmentsDao.getAppointmentsByUser(userId)
}

export async function createAppointment(newAppointmentReq: CreateAppointmentRequest, currentUser: string): Promise<Appointment> {

    const staffItem: Staff = await staffDao.loadStaff(newAppointmentReq.staffId)
    if (!staffItem)
        throw new Error(`Invalid staff id ${newAppointmentReq.staffId}`)
    
    const newItem: Appointment = {
        userId: currentUser,
        appointmentId: uuid.v4(),
        staffId: staffItem.staffId,
        createdAt: new Date().toISOString(),
        username: newAppointmentReq.name,
        dueDatetime: newAppointmentReq.dueDatetime,
        done: false
    }

    return await appointmentsDao.createAppointment(newItem)  
}

export async function deleteAppointment(appointmentId: string, currentUser: string) {
    let delItem = await getAppointment(appointmentId, currentUser)
    if (!delItem) {
        return
    }

    await appointmentsDao.deleteAppointment(delItem)
    return delItem
}

export async function getAppointment(appointmentId: string, currentUser: string): Promise<Appointment> {

    const anItem = {
        userId: currentUser,
        appointmentId: appointmentId
    } as Appointment

    return await appointmentsDao.loadAppointment(anItem)  
}

export async function updateAppointment(appointmentId: string, currentUser: string, updateReq: UpdateAppointmentRequest): Promise<Appointment> {

    let itemToUpdate = await getAppointment(appointmentId, currentUser)
    if (!itemToUpdate) {
        return
    }
    console.log(updateReq)
    //const updatedAppointment = updateReq as AppointmentUpdate
    //await appointmentsDao.updateAppointment(itemToUpdate, updatedAppointment)

    //itemToUpdate = {...updatedAppointment} as Appointment
    return itemToUpdate
}

export async function attachFile(appointmentId: string, currentUser: string, filename: string): Promise<Appointment> {
    let itemToUpdate = await getAppointment(appointmentId, currentUser)
    if (!itemToUpdate) {
        return
    }

    await appointmentsDao.attachFile(itemToUpdate, filename)

    return itemToUpdate
}