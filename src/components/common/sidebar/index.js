import React from 'react';
import './sidebar.scss';
import classNames from 'classnames/bind';

import routes from '../../../routes.json'
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { switchmobsidebar, modifycredentials, modifywarning } from '../../../store/actions';

import { Modal } from 'reactstrap';

class Sidebar extends React.Component {
    constructor(props) {
        super(props);
        this.state = { showModal: false, modalMsg: '', modalCloseAllowed: true };
    }

    componentDidMount() {
        let minsRem = Math.floor((new Date(this.props.credentials.TokenExpiresOn) - (new Date() - this.props.credentials.LocalServerTimeDiff)) / 60000),
            toMillis = (min) => (min * 60000);

        if (minsRem > 10) {
            setTimeout(() => () => {
                this.setState({
                    showModal: true,
                    modalMsg: 'Your session will be expired in 10 minutes. To continue without interruptions please re-login.'
                });
            }, toMillis(minsRem - 10));
        }
        if (minsRem > 5) {
            setTimeout(() => () => {
                this.setState({
                    showModal: true,
                    modalMsg: 'Your session will be expired in 5 minutes. To continue without interruptions please re-login.'
                });
            }, toMillis(minsRem - 5));
        }
        setTimeout(() => {
            this.setState({
                showModal: true,
                modalMsg: 'Your session has expired. You are being logged out automatically. Sorry for the inconvinience caused.',
                modalCloseAllowed: false
            });
            setTimeout(async () => {
                document.cookie = "credentials=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
                this.props.modifycredentials({});
                this.props.history.push("/login");
            }, 15000);
        }, toMillis(minsRem - 1));
    }

    async logout() {
        this.props.modifywarning({
            show: true,
            text: "Are you sure you wish to logout?",
            onClick: async () => {
                document.cookie = "credentials=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
                await this.props.modifycredentials({});
                this.props.history.push("/login");
            }
        })
    }

    render() {
        let { credentials, mobile } = this.props,
            { Data } = credentials;

        return (
            <React.Fragment>
                <div className={classNames("sidebar h-100", { "sidebarCollapse": this.props.desktop })}>
                    <div className={classNames("nav-item sidebar-profile media flex-row align-items-center", { "active": ("/profile" === this.props.match.path || this.props.match.path.indexOf("/profile") === 0) })} /*onClick={() => { this.props.history.push("/profile"); this.props.switchmobsidebar() }} */ style={{ "cursor": "default" }}>
                        <img src={require('../../../img/avatar-a.png')} className="avatar align-self-center mr-3" alt="avatar" />
                        <div className="media-body align-self-center">
                            <p className="mb-2 text-white profile-primary">
                                {
                                    Boolean(Data) &&
                                    `${Data[0].FirstName} ${Data[0].LastName}`
                                }
                            </p>
                            <p className="mb-0 text-white profile-secondary">
                                {
                                    Boolean(Data) &&
                                    `${Data[0].UserName}`
                                }
                            </p>
                        </div>
                    </div>
                    <div className="sidebar-menu">
                        <div className="w-100">
                            <ul className="nav flex-column sidebar-links">
                                {
                                    routes.routes.filter(x => x.showInSidebar && (x.code && Boolean(credentials.RoleData) && credentials.RoleData[0].RoleMenus.find(y => y.MenuCode === x.code))).map(x => {
                                        return (
                                            <li key={x.name} className={classNames("nav-item flex-row align-items-center", { "active": (x.path === this.props.match.path || this.props.match.path.indexOf(x.path) === 0) })} onClick={() => { this.props.history.push(x.sidebarLink); if (!mobile) { this.props.switchmobsidebar() } }}>
                                                <i className={x.icon}></i>
                                                <span>{x.name}</span>
                                            </li>
                                        )
                                    })
                                }
                            </ul>
                        </div>
                    </div>
                    <div className="w-100 notify-menu">
                        <ul className="nav flex-column sidebar-links">
                            <li className={classNames("nav-item flex-row align-items-center", { "active": ("/notifications" === this.props.match.path || this.props.match.path.indexOf("/notifications") === 0) })} onClick={() => { this.props.history.push("/notifications"); if (!mobile) { this.props.switchmobsidebar() } }}>
                                <i className="fas fa-bell"></i>
                                <span>Notification</span>
                            </li>
                            <li className="nav-item flex-row align-items-center" onClick={() => this.logout()}>
                                <i className="fas fa-sign-out-alt"></i>
                                <span>Logout</span>
                            </li>
                        </ul>
                    </div>
                </div>

                <Modal isOpen={this.state.showModal} toggle={() => (this.state.modalCloseAllowed ? this.setState({ showModal: false }) : null)} className="modal-dialog-centered">
                    <div className="modal-body text-center">
                        <div className="warning-icon"><i class="fas fa-exclamation-triangle"></i></div>
                        <h4 className="modal-title my-3">{this.state.modalMsg}</h4>
                        {
                            this.state.modalCloseAllowed &&
                            <div className="modal-button-wrap text-centre">
                                <button type="button" onClick={() => this.setState({ showModal: false })} className="btn btn-outline-primary px-4">Close</button>
                            </div>
                        }
                    </div>
                </Modal>
            </React.Fragment>
        );
    }
}

const mapStateToProps = (state) => {
    let { credentials, layout } = state,
        { sidebar } = layout,
        { desktop, mobile } = sidebar;
    return { credentials, desktop }
};

const mapDispatchToProps = dispatch => (
    bindActionCreators({
        switchmobsidebar,
        modifycredentials,
        modifywarning
    }, dispatch)
);

export default connect(mapStateToProps, mapDispatchToProps)(Sidebar);