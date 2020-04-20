//import * as uuid from 'uuid'

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

export async function createAppointment(currentUser: string, newAppointmentReq: CreateAppointmentRequest): Promise<Appointment> {

    const staffItem: Staff = await staffDao.loadStaff(newAppointmentReq.staffId)
    if (!staffItem)
        throw new Error(`Invalid staff id ${newAppointmentReq.staffId}`)
    
    const newItem: Appointment = {
        userId: currentUser,
        dueDatetime: newAppointmentReq.dueDatetime,
        staffId: staffItem.staffId,
        createdAt: new Date().toISOString(),
        username: newAppointmentReq.name,
        done: false
    }

    let conflictItem: Appointment
    conflictItem = await appointmentsDao.loadStaffAppointment(newItem)
    if (conflictItem)
        throw new Error('Appointment conflicts with existing one, please choose another slot/date')

    return await appointmentsDao.createAppointment(newItem)  
}

export async function deleteAppointment(currentUser: string, appDateTimeId: number) {
    let delItem = await getAppointment(currentUser, appDateTimeId)
    if (!delItem) {
        return
    }

    await appointmentsDao.deleteAppointment(delItem)
    return delItem
}

export async function getAppointment(currentUser: string, appDateTimeId: number): Promise<Appointment> {

    const anItem = {
        userId: currentUser,
        dueDatetime: appDateTimeId
    } as Appointment

    return await appointmentsDao.loadUserAppointment(anItem)  
}

export async function updateAppointment(currentUser: string, appDateTimeId: number, updateReq: UpdateAppointmentRequest): Promise<Appointment> {

    let itemToUpdate = await getAppointment(currentUser, appDateTimeId)
    if (!itemToUpdate) {
        return
    }
    
    await appointmentsDao.updateAppointment(itemToUpdate, updateReq)
    return itemToUpdate
}

export async function attachFile(currentUser: string, appDateTimeId: number, filename: string): Promise<Appointment> {
    let itemToUpdate = await getAppointment(currentUser, appDateTimeId)
    if (!itemToUpdate) {
        return
    }

    await appointmentsDao.attachFile(itemToUpdate, filename)

    return itemToUpdate
}