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
  Image,
  Loader
} from 'semantic-ui-react'

import Auth from '../auth/Auth'
import { getStaff } from '../api/backend-api'
import { Staff } from '../types/Staff'

interface StaffListProps {
  auth: Auth
  onStaffListLoad(newStaffList: Staff[]): any
}

interface StaffListState {
  staffList: Staff[]
  loadingStaff: boolean
}

export class StaffList extends React.PureComponent<StaffListProps, StaffListState> {
  state: StaffListState = {
    staffList: [],
    loadingStaff: true
  }

  async componentDidMount() {
    try {
      const staffList = await getStaff()
      this.setState({
        staffList,
        loadingStaff: false
      })
      
    } catch (e) {
      alert(`Failed to fetch staff: ${e.message}`)
    }
  }

  componentDidUpdate(prevProps: StaffListProps, prevState: StaffListState) {

    if (this.state.staffList !== prevState.staffList) {
      this.props.onStaffListLoad(this.state.staffList)
    }
  }

  render() {
    return (
      <div>
        <Header as="h1">Staff</Header>

        {this.renderAvailableStaff()}
      </div>
    )
  }

  renderAvailableStaff() {
    if (this.state.loadingStaff) {
      return this.renderLoading()
    }

    return this.renderStaffList()
  }

  renderLoading() {
    return (
      <Grid.Row>
        <Loader indeterminate active inline="centered">
          Loading Staff
        </Loader>
      </Grid.Row>
    )
  }

  renderStaffList() {
    return (
      <Grid padded>
        <Grid.Row>
          {this.state.staffList.map((staffMember, pos) => {
            return (
                <Grid.Column key={staffMember.staffId} width={3} verticalAlign="middle">
                  {staffMember.name} - {staffMember.staffId}
                </Grid.Column>
            )
          })}
          <Grid.Column width={16}>
            <Divider />
          </Grid.Column>
        </Grid.Row>
      </Grid>
    )
  }
}
