import React from 'react';
import './login.scss';

import axios from 'axios';
import { toast } from 'react-toastify';
import { rootURL, ops } from '../../config';

import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { modifycredentials, addloader, removeloader, modifyerror } from '../../store/actions';


class Login extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            Username: "",
            Password: ""
        }
       // this.checkPersistence();
    }

    componentDidMount() {
        let urlParams = new URL(window.location.href),
            samaToken = urlParams.searchParams.get('target');

        if (samaToken) {
            this.samaLoginCheck(samaToken)
        }
    }

    async samaLoginCheck(samaToken) {
        let dtNow = new Date();

        this.props.addloader('samaLogin');

        await axios(rootURL + ops.users.samalogin + "?key=" + samaToken, {
            method: 'GET',
            headers: {
                "Content-Type": "application/json"
            }
        })
            .then(async response => {
                if (response.statusText === "OK") {
                    if (response.data.Status === "Success" && response.data.TokenKey) {
                        if (response.data.RoleData.length) {
                            let credObj = Object.assign({}, response.data);
                            credObj.LocalServerTimeDiff = dtNow - new Date(credObj.ServerDateTime);
                            credObj.expires_in = new Date(credObj.TokenExpiresOn).getTime() - new Date(credObj.ServerDateTime).getTime();
                            await this.props.modifycredentials(credObj);
                            document.cookie = `credentials=${JSON.stringify(credObj)}; path=/; expires=${new Date(new Date().getTime() + credObj.expires_in).toUTCString()}`;
                            this.props.history.push('/dashboard');
                        }
                        else {
                            toast.error("No Authorisation");
                        }
                    }
                    else {
                        this.props.modifyerror({
                            show: true,
                            heading: "SAMA Login Failed!",
                            text: response.data.StatusMessage
                        });
                        this.props.history.push('/login');
                    }
                }
                else {
                    this.props.modifyerror({ show: true });
                }
            })
            .catch(error => {
                this.props.modifyerror({ show: true });
                console.log("error", error)
            });

        this.props.removeloader('samaLogin');
    }

    async checkPersistence() {
        let cookies = document.cookie ? document.cookie.split(';').map(x => x.split('=').map(y => y.trim())) : false,
            credentials = (cookies && cookies.find(x => x[0] === "credentials")) ? JSON.parse(cookies.find(x => x[0] === "credentials")[1]) : null;

        if (credentials) {
            await this.props.modifycredentials(credentials);
            console.log("props1",this.props);
            if (this.props.match && this.props.match.params && this.props.match.params.redirectTo) {
                this.props.history.push(`/${this.props.match.params.redirectTo}`);
            }
            else {
                console.log("props1 else",this.props);
                this.props.history.push('/dashboard');
            }
        }
    }

    async loginAPI(e) {
        e.preventDefault();
        let { Username, Password } = this.state;
        if (Username && Password) {
            let self = this,
                dtNow = new Date(),
                body = {
                    "UserName": Username,
                    "UserPassword": Password
                },
                notificationToken = await localStorage.getItem('notification-token');
            this.props.addloader('login');

            if (notificationToken) {
                body.FirebaseToken = notificationToken;
            }

            await axios(rootURL + ops.users.login, {
                method: 'POST',
                headers: {
                    "Content-Type": "application/json"
                },
                data: JSON.stringify(body)
            })
                .then(async function (response) {
                    if (response.statusText === "OK") {
                        if (response.data.Status === "Success" && response.data.TokenKey) {
                            if (response.data.RoleData.length) {
                                let credObj = Object.assign({}, response.data);
                                credObj.LocalServerTimeDiff = dtNow - new Date(credObj.ServerDateTime);
                                credObj.expires_in = new Date(credObj.TokenExpiresOn).getTime() - new Date(credObj.ServerDateTime).getTime();
                                await self.props.modifycredentials(credObj);

                                document.cookie = `credentials=${JSON.stringify(credObj)}; path=/; expires=${new Date(new Date().getTime() + credObj.expires_in).toUTCString()}`;

                                if (self.props.match && self.props.match.params && self.props.match.params.redirectTo) {
                                    console.log("props2",this.props);
                                    self.props.history.push(`/${self.props.match.params.redirectTo}`);
                                }
                                else {
                                    console.log("props2",response.data.RoleData[0].RoleMenus[0].MenuDescription);
                                     if(response.data.RoleData[0].RoleMenus[0].MenuDescription === 'Order'){
                                        self.props.history.push('/order');
                                     }else if(response.data.RoleData[0].RoleMenus[0].MenuDescription === 'Master Data'){
                                        self.props.history.push('/masterdata');
                                     }else if(response.data.RoleData[0].RoleMenus[0].MenuDescription === 'Gate to Gate'){
                                        self.props.history.push('/gatetogate');
                                     }else if(response.data.RoleData[0].RoleMenus[0].MenuDescription === 'Trip Management'){
                                        self.props.history.push('/tripmanagement');
                                     }else if(response.data.RoleData[0].RoleMenus[0].MenuDescription === 'Report'){
                                        self.props.history.push('/report');
                                     }else if(response.data.RoleData[0].RoleMenus[0].MenuDescription === 'Authorization'){
                                        self.props.history.push('/authorization/:tab');
                                     }else{
                                        self.props.history.push('/dashboard');
                                     }
                                    
                                }
                            }
                            else {
                                toast.error("No Authorisation");
                            }
                        }
                        else {
                            toast.error(response.data.StatusMessage);
                        }
                    }
                    else {
                        self.props.modifyerror({ show: true });
                    }
                })
                .catch(function (error) {
                    self.props.modifyerror({ show: true });
                    console.log("error", error)
                });

            this.props.removeloader('login');
        }
        else {
            this.props.modifyerror({
                show: true,
                heading: "Invalid Credentials!",
                text: "Please enter valid credentials."
            });
        }
    }

    render() {
        return (
            <div className="Login">

                <header className="px-4 py-3">
                    <div className="row m-0">
                        <div className="col-12 col-sm-12 col-md-6 col-lg-6">
                            <p className="mb-0 font-weight-bold title_clr">TRANSPORTATION MANAGEMENT SYSTEM</p>
                        </div>
                        <div className="col-12 col-sm-12 col-md-6 col-lg-6">
                            <div className="logo text-right">
                                <img title="ASTRA MOTOR LOGO" alt="ASTRA MOTOR LOGO" src={require('../../img/honda-logo.png')} />
                            </div>
                        </div>
                    </div>
                </header>

                <div className="row m-0 body_h bgbody_clr text-right">
                    <div className="col-12 col-sm-12 col-md-6 col-lg-6 position-relative">
                        <form className="login_box shadow-sm px-5 py-4" onSubmit={e => this.loginAPI(e)}>
                            <h3 className="mb-4 title_clr text-center">LOGIN</h3>
                            <div className="form-group">
                                <input type="text" className="form-control" placeholder="Username" value={this.state.Username} onChange={e => this.setState({ Username: e.target.value })} />
                            </div>
                            <div className="form-group">
                                <input type="password" className="form-control" placeholder="Password" value={this.state.Password} onChange={e => this.setState({ Password: e.target.value })} />
                            </div>
                            <p className="text-right mb-2">forgot password?</p>
                            <button type="submit" className="btn btn-primary login_btn px-4">login</button>
                        </form>
                        {/* <div className="btn_box">
                        <p className="text-right mb-2">
                            forgot password?
                        </p>
                        <button type="button" className="btn btn-primary login_btn px-4">login</button>
                    </div> */}
                    </div>
                    <div className="col-12 col-sm-12 col-md-6 col-lg-6 pr-0">
                        <div className="text-right pt-5 mbl_padd">
                            <img title="" alt="ASTRA MOTOR DASHBOARD LOGO" className="img-fluid" src={require('../../img/img_dashboard_ilus.png')} />
                        </div>
                    </div>
                </div>

            </div>
        )
    }
}

const mapDispatchToProps = dispatch => (
    bindActionCreators({
        modifycredentials,
        addloader,
        removeloader,
        modifyerror
    }, dispatch)
);

export default connect(null, mapDispatchToProps)(Login);