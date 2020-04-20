import { StaffDao } from "../dao/staffDao"
import { Staff } from "../models/Staff";

const staffDao = new StaffDao

export async function getAllAvailableStaff(): Promise<Staff[]> {
    return staffDao.getAllStaff()
}