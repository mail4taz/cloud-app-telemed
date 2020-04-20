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
    slotOption: '',
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

  onEditButtonClick = (appointmentId: string) => {
    this.props.history.push(`/appointments/${appointmentId}/edit`)
  }

  onAppointmentCreate = async (event: React.ChangeEvent<HTMLButtonElement>) => {
    try {
      console.log(this.state)
      const dueDate = this.calculateDueDate()
      const newAppointment = await createAppointment(this.props.auth.getIdToken(), {
        name: this.state.newAppointmentName,
        dueDatetime: dueDate,
        staffId: 'uuid1'
      })
      this.setState({
        appointments: [...this.state.appointments, newAppointment],
        newAppointmentName: ''
      })
    } catch {
      alert('Appointment creation failed')
    }
  }

  onAppointmentDelete = async (appointmentId: string) => {
    try {
      await deleteAppointment(this.props.auth.getIdToken(), appointmentId)
      this.setState({
        appointments: this.state.appointments.filter(appointment => appointment.appointmentId != appointmentId)
      })
    } catch {
      alert('Appointment deletion failed')
    }
  }

  onAppointmentCheck = async (pos: number) => {
    try {
      const appointment = this.state.appointments[pos]
      await patchAppointment(this.props.auth.getIdToken(), appointment.appointmentId, {
        //name: appointment.username,
        dueDatetime: appointment.dueDatetime
        //done: !appointment.done
      })
      this.setState({
        appointments: update(this.state.appointments, {
          [pos]: { done: { $set: !appointment.done } }
        })
      })
    } catch {
      alert('Appointment update failed')
    }
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
    const arr = this.props.staffList && (this.props.staffList.length > 0) ? this.props.staffList : []
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
            placeholder="Enter a name and find a time ..."
            onChange={this.handleNameChange}
          />
          &nbsp;&nbsp;&nbsp;
          <DatePicker value={this.state.dateOption} onChange={this.onChangeDate} />
          &nbsp;&nbsp;&nbsp;
          <Dropdown  inline header='Adjust time span' options={this.props.timeslotList} defaultValue={this.props.timeslotList[0].value} onChange={this.onChangeSlot} />
          &nbsp;&nbsp;&nbsp;
          <Select placeholder='Select staff' options={arr} width={5} onChange={this.onChangeStaff} />
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
            <Grid.Row key={appointment.appointmentId}>
              <Grid.Column width={1} verticalAlign="middle">
                <Checkbox
                  onChange={() => this.onAppointmentCheck(pos)}
                  checked={appointment.done}
                />
              </Grid.Column>
              <Grid.Column width={10} verticalAlign="middle">
                {appointment.username}
              </Grid.Column>
              <Grid.Column width={3} floated="right">
                {appointment.dueDatetime}
              </Grid.Column>
              <Grid.Column width={1} floated="right">
                <Button
                  icon
                  color="blue"
                  onClick={() => this.onEditButtonClick(appointment.appointmentId)}
                >
                  <Icon name="pencil" />
                </Button>
              </Grid.Column>
              <Grid.Column width={1} floated="right">
                <Button
                  icon
                  color="red"
                  onClick={() => this.onAppointmentDelete(appointment.appointmentId)}
                >
                  <Icon name="delete" />
                </Button>
              </Grid.Column>
              {appointment.attachmentUrl && (
                <Image src={appointment.attachmentUrl} size="small" wrapped />
              )}
              <Grid.Column width={16}>
                <Divider />
              </Grid.Column>
            </Grid.Row>
          )
        })}
      </Grid>
    )
  }

  calculateDueDate(): string {
    const date = new Date()
    date.setDate(date.getDate() + 7)

    return dateFormat(date, 'yyyy-mm-dd') as string
  }
}
