import React, { Component } from 'react'
import { Link, Route, Router, Switch } from 'react-router-dom'
import { Grid, Menu, Segment } from 'semantic-ui-react'

import Auth from './auth/Auth'
import { timeslots } from './config'
import { EditAppointment } from './components/EditAppointment'
import { LogIn } from './components/LogIn'
import { NotFound } from './components/NotFound'
import { Appointments } from './components/Appointments'
import { StaffList } from './components/StaffList'
import { Staff } from './types/Staff'

export interface AppProps {}

export interface AppProps {
  auth: Auth
  history: any
}

export interface AppState {
  staffList: any[]
}

export default class App extends Component<AppProps, AppState> {
  constructor(props: AppProps) {
    super(props)

    this.handleLogin = this.handleLogin.bind(this)
    this.handleLogout = this.handleLogout.bind(this)
    this.handleStaffLoad = this.handleStaffLoad.bind(this)
    this.state = {staffList: []}
  }

  handleLogin() {
    this.props.auth.login()
  }

  handleLogout() {
    this.props.auth.logout()
  }

  handleStaffLoad(newStaffList: Staff[]) {
    let selectList = []
    for (const s of newStaffList) {
      selectList.push({ key: s.staffId, value: s.staffId, text: s.name } )
    }
    this.setState( {staffList: selectList} )
  }

  render() {
    return (
      <div>
        <Segment style={{ padding: '8em 0em' }} vertical>
          <Grid container stackable verticalAlign="middle">
            <Grid.Row>
              <Grid.Column width={16}>
                <Router history={this.props.history}>
                  {this.generateMenu()}

                  {this.generateCurrentPage()}
                </Router>
              </Grid.Column>
            </Grid.Row>
          </Grid>
        </Segment>
      </div>
    )
  }

  generateMenu() {
    return (
      <Menu>
        <Menu.Item name="home">
          <Link to="/">Home</Link>
        </Menu.Item>

        <Menu.Menu position="right">{this.logInLogOutButton()}</Menu.Menu>
      </Menu>
    )
  }

  logInLogOutButton() {
    if (this.props.auth.isAuthenticated()) {
      return (
        <Menu.Item name="logout" onClick={this.handleLogout}>
          Log Out
        </Menu.Item>
      )
    } else {
      return (
        <Menu.Item name="login" onClick={this.handleLogin}>
          Log In
        </Menu.Item>
      )
    }
  }

  generateCurrentPage() {

    if (!this.props.auth.isAuthenticated()) {
      return <LogIn auth={this.props.auth} />
    }

    return (
      <Switch>
        <Route
          path="/"
          exact
          render={props =>
            <div>
              <StaffList {...props} auth={this.props.auth} onStaffListLoad={this.handleStaffLoad}/>
              <br/>
              <Appointments {...props} auth={this.props.auth} staffList={this.state.staffList} timeslotList={timeslots}/>
            </div>
          }
        />

        <Route
          path="/appointments/:appointmenId/edit"
          exact
          render={props => {
            return <EditAppointment {...props} auth={this.props.auth} />
          }}
        />

        <Route component={NotFound} />
      </Switch>
    )
  }
}
