import dateFormat from 'dateformat'
import { History } from 'history'
import update from 'immutability-helper'
import * as React from 'react'
import {
  Button,
  Checkbox,
  Divider,
  Grid,
  Header,
  Icon,
  Input,
  Select,
  Dropdown,
  Image,
  List,
  Loader
} from 'semantic-ui-react'
import DatePicker from 'react-date-picker';

import { LogIn } from './LogIn'
import { createAppointment, deleteAppointment, getAppointments, patchAppointment } from '../api/backend-api'
import Auth from '../auth/Auth'
import { Appointment } from '../types/Appointment'
import { Staff } from '../types/Staff'

interface AppointmentsProps {
  auth: Auth
  staffList: Staff[]
  timeslotList: any[]
  history: History
}

interface AppointmentsState {
  appointments: Appointment[]
  newAppointmentName: string
  loadingAppointments: boolean
  dateOption: Date
  slotOption: string
  staffOption: string
}

export class Appointments extends React.PureComponent<AppointmentsProps, AppointmentsState> {
  state: AppointmentsState = {
    appointments: [],
    newAppointmentName: '',
    loadingAppointments: true,
    dateOption: new Date(),
    slotOption: this.props.timeslotList[0].value,
    staffOption: ''
  }

  handleNameChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    this.setState({ newAppointmentName: event.target.value })
  }

  onChangeDate = (date: any) => {
    //console.log(date)
    this.setState({ dateOption: date as Date})
  }

  onChangeSlot = (event: any, data: any) => {
    //console.log(data)
    this.setState({ slotOption: data.value as string})
  }

  onChangeStaff = (event: any, data: any) => {
    //console.log(event.target)
    this.setState({ staffOption: data.value as string})
  }

  onEditButtonClick = (appDateTimeId: number) => {
    this.props.history.push(`/appointments/${appDateTimeId}/edit`)
  }

  onAppointmentCreate = async (event: React.ChangeEvent<HTMLButtonElement>) => {
    if (! (this.state.newAppointmentName && this.state.dateOption 
            && this.state.slotOption && this.state.staffOption))
    {
      alert('Please enter name / date / chosen staff')
      return
    }

    try {
      const dueDatetime = this.calculateAppDate(this.state.dateOption, this.state.slotOption)
      //console.log(`New appointment id - ${dueDatetime}`)
      const newAppointment = await createAppointment(this.props.auth.getIdToken(), {
        name: this.state.newAppointmentName,
        dueDatetime: dueDatetime,
        staffId: this.state.staffOption
      })

      this.setState({
        appointments: [...this.state.appointments, newAppointment],
        newAppointmentName: '',
        dateOption: new Date(),
        staffOption: this.state.staffOption,
        slotOption: this.props.timeslotList[0].value
      })

    } catch (e) {
      alert('Appointment creation failed - ' + e.message)
    }
  }

  onAppointmentDelete = async (appDateTimeId: number) => {
    try {
      await deleteAppointment(this.props.auth.getIdToken(), appDateTimeId)
      this.setState({
        appointments: this.state.appointments.filter(appointment => appointment.dueDatetime != appDateTimeId)
      })
    } catch {
      alert('Appointment deletion failed')
    }
  }

  onAppointmentCheck = async (pos: number) => {
    try {
      const appointment = this.state.appointments[pos]
      await patchAppointment(this.props.auth.getIdToken(), appointment.dueDatetime, {
        done: !appointment.done
      })
      this.setState({
        appointments: update(this.state.appointments, {
          [pos]: { done: { $set: !appointment.done } },
        })
      })
    } catch {
      alert('Appointment update failed')
    }
  }

  getStaffName(staffId: string) {
    for (const s of this.props.staffList) {
      if (s.staffId == staffId)
        return s.name
    }

    return staffId;
  }

  getStaffSelectOptions()
  {
    let optionsArr = []
    for (const s of this.props.staffList)
    {
      optionsArr.push({ key: s.staffId, value: s.staffId, text: s.name })
    }

    return optionsArr
  }

  async componentDidMount() {
    try {
      const appointments = await getAppointments(this.props.auth.getIdToken())
      this.setState({
        appointments,
        loadingAppointments: false
      })
    } catch (e) {
      alert(`Failed to fetch appointments: ${e.message}`)
    }
  }

  render() {

    return (
      <div>
        <Header as="h1">Appointments</Header>

        {this.renderCreateAppointmentInput()}

        {this.renderAppointments()}
      </div>
    )
  }

  renderCreateAppointmentInput() {

    return (
      <Grid.Row>
        <Grid.Column width={5}>
          <Input
            action={{
              color: 'teal',
              labelPosition: 'left',
              icon: 'add',
              content: 'New appointment',
              onClick: this.onAppointmentCreate
            }}
            actionPosition="left"
            value={this.state.newAppointmentName}
            placeholder="Enter a name and find a time ..."
            onChange={this.handleNameChange}
          />
          &nbsp;&nbsp;&nbsp;
          <DatePicker value={this.state.dateOption} onChange={this.onChangeDate} minDate={new Date()}/>
          &nbsp;&nbsp;&nbsp;
          <Dropdown  inline header='Adjust time span' options={this.props.timeslotList} defaultValue={this.props.timeslotList[0].value} onChange={this.onChangeSlot} />
          &nbsp;&nbsp;&nbsp;
          <Select placeholder='Select staff' options={this.getStaffSelectOptions()} defaultValue={this.state.staffOption} onChange={this.onChangeStaff} width={5} />
        </Grid.Column>
        <Grid.Column width={16}>
          <Divider />
        </Grid.Column>
      </Grid.Row>
    )
  }

  renderAppointments() {
    if (this.state.loadingAppointments) {
      return this.renderLoading()
    }

    return this.renderAppointmentsList()
  }

  renderLoading() {
    return (
      <Grid.Row>
        <Loader indeterminate active inline="centered">
          Loading Appointments
        </Loader>
      </Grid.Row>
    )
  }

  renderAppointmentsList() {
    return (
      <Grid padded>
        {this.state.appointments.map((appointment, pos) => {
          return (
            <Grid.Row key={appointment.dueDatetime}>
              <Grid.Column width={1} verticalAlign="middle">
                <Checkbox
                  onChange={() => this.onAppointmentCheck(pos)}
                  checked={appointment.done}
                />
              </Grid.Column>
              <Grid.Column width={3} verticalAlign="middle">
                {appointment.username} @ {this.getStaffName(appointment.staffId)}
              </Grid.Column>
              <Grid.Column width={5}>
                <List>
                  {this.getFileSummaryList(appointment.attachmentsUrl).map((fname, pos) => {
                      return (
                        <List.Item key={pos}><a href={fname.link}>{fname.path}</a></List.Item>
                      )  
                    })
                  }
                </List>

              </Grid.Column>
              <Grid.Column width={3} floated="right">
                {this.getAppDateFromUnixtime(appointment.dueDatetime)}
              </Grid.Column>
              <Grid.Column floated="right">
                <Button
                  icon
                  color="blue"
                  onClick={() => this.onEditButtonClick(appointment.dueDatetime)}
                >
                  <Icon name="pencil" />
                </Button>
              </Grid.Column>
              <Grid.Column floated="right">
                <Button
                  icon
                  color="red"
                  onClick={() => this.onAppointmentDelete(appointment.dueDatetime)}
                >
                  <Icon name="delete" />
                </Button>
              </Grid.Column>
              <Grid.Column width={16}>
                <Divider />
              </Grid.Column>
            </Grid.Row>
          )
        })}
      </Grid>
    )
  }

  calculateAppDate(date: Date, slot: string): number {
    date.setUTCDate(date.getDate())

    try {
      const timeArr = slot.split(':')
      date.setUTCHours(parseInt(timeArr[0]))
      date.setUTCMinutes(parseInt(timeArr[1]))
    }
    catch (e) {
      throw Error('Invalid date and time provided')
    }

    //console.log(date.toUTCString())
    // shave off the miliseconds from the unix time
    const unixSeconds = date.valueOf() / 1000
    return parseInt(unixSeconds.toString())
  }

  getAppDateFromUnixtime(unixtime: number): string {
    const date = new Date(unixtime * 1000)

    //console.log(date.toJSON())
    return dateFormat(date, "yyyy-mm-dd HH:MM", true, true) as string
  }

  getFileSummaryList(listOfFiles: any): any[] {
    let files = []
    if (listOfFiles && listOfFiles.length) {
      for (const s of listOfFiles) {
        files.push({ path: s.toString().replace('https://files-sls-dev.s3.us-east-2.amazonaws.com/', '').substr(0,30) + '...', link: s.toString() })
      }
    }
    
    return files
  }
}
