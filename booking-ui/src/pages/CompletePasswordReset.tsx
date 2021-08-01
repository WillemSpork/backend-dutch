import React from 'react';
import './CenterContent.css';
import { withTranslation } from 'react-i18next';
import { TFunction } from 'i18next';
import { Link, RouteChildrenProps } from 'react-router-dom';
import { Ajax } from 'flexspace-commons';
import { Button, Form } from 'react-bootstrap';

interface State {
  loading: boolean
  complete: boolean
  success: boolean
  newPassword: string
}

interface RoutedProps {
  id: string
}

interface Props extends RouteChildrenProps<RoutedProps> {
  t: TFunction
}

class CompletePasswordReset extends React.Component<Props, State> {
  constructor(props: any) {
    super(props);
    this.state = {
      loading: false,
      complete: false,
      success: false,
      newPassword: ""
    };
  }

  onPasswordSubmit = (e: any) => {
    e.preventDefault();
    let id = this.props.match?.params.id;
    if (!id || this.state.newPassword.length < 8) {
      return;
    }
    this.setState({ loading: true, complete: false, success: false });
    let payload = {
      "password": this.state.newPassword
    };
    Ajax.postData("/auth/pwreset/" + id, payload).then((res) => {
      if (res.status >= 200 && res.status <= 299) {
        this.setState({ loading: false, complete: true, success: true });
      } else {
        this.setState({ loading: false, complete: true, success: false });
      }
    }).catch((e) => {
      this.setState({ loading: false, complete: true, success: false });
    });
  }

  render() {
    if (this.state.complete && this.state.success) {
      return (
        <div className="container-center">
          <div className="container-center-inner">
            <img src="./seatsurfing.svg" alt="Seatsurfing" className="logo" />
            <p>{this.props.t("passwordChanged")}</p>
            <p><Link to="/login" className="btn btn-primary">{this.props.t("proceedToLogin")}</Link></p>
          </div>
        </div>
      );
    }

    return (
      <div className="container-center">
        <Form className="container-center-inner" onSubmit={this.onPasswordSubmit}>
          <img src="./seatsurfing.svg" alt="Seatsurfing" className="logo" />
          <Form.Group>
            <Form.Control type="password" placeholder={this.props.t("newPassword")} value={this.state.newPassword} onChange={(e: any) => this.setState({ newPassword: e.target.value, complete: false })} required={true} autoFocus={true} minLength={8} disabled={this.state.loading} isInvalid={this.state.complete && !this.state.success} />
            <Form.Control.Feedback type="invalid">{this.props.t("errorInvalidPassword")}</Form.Control.Feedback>
          </Form.Group>
          <Button variant="primary" type="submit" disabled={this.state.loading}>{this.props.t("changePassword")}</Button>
        </Form>
      </div>
    );
  }
}

export default withTranslation()(CompletePasswordReset as any);
