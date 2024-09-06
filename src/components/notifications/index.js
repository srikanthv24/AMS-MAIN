import React from 'react';
import './notifications.scss';

import axios from 'axios';
import { toast } from 'react-toastify';
import { rootURL, ops } from '../../config';

import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { addloader, removeloader, modifyerror } from '../../store/actions';

class Notifications extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            notifications: []
        }
    }

    componentDidMount() {
        this.getNotifications();
    }

    async getNotifications() {
        this.props.addloader('getNotifications');

        await axios(rootURL + ops.users.notifications, {
            method: 'POST',
            headers: {
                "Content-Type": "application/json",
                "Token": this.props.credentials.TokenKey
            },
            data: JSON.stringify({
                "Requests": [
                    {}
                ]
            })
        })
            .then((response) => {
                if (response.statusText === "OK") {
                    if (response.data.Status === "Success" && Array.isArray(response.data.data)) {
                        this.setState({ notifications: response.data.data })
                    }
                }
                else {
                    this.props.modifyerror({ show: true });
                }
            })
            .catch((error) => {
                this.props.modifyerror({ show: true });
                console.log("error", error)
            });

        this.props.removeloader('getNotifications');
    }

    render() {
        let { notifications } = this.state;
        return (
            <React.Fragment>
                <div className="Notifications">
                    <div className="tabs-wrap">
                        <div className="tabs-header-wrap">
                            <div className="tabs-title d-none d-md-block d-lg-block active">Notification</div>
                            <div className="clearfix"></div>
                        </div>
                        <div className="tabs-content">

                            {
                                notifications.length ?
                                    notifications.map((x) =>
                                        <div key={x.ID} className="row m-0 py-3 d-flex align-items-center">
                                            <div className="col-3 col-sm-2 col-md-2 col-lg-2 col-xl-1 pr-md-0 pr-lg-0 pr-xl-0">
                                                <div className="circle bg-primary">
                                                    <i className="fas fa-bell fa-lg text-light"></i>
                                                </div>
                                            </div>
                                            <div className="col-9 col-sm-10 col-md-10 col-lg-10 col-xl-11">
                                                <p className="m-0">{x.Status}</p>
                                                <sup className="text-secondary">{x.Date}</sup>
                                            </div>
                                        </div>
                                    )
                                    :
                                    <p className="text-center">No notifications to display.</p>
                            }

                        </div>
                    </div>
                </div>
            </React.Fragment>
        );
    }
}


const mapStateToProps = state => {
    let { credentials } = state;
    return { credentials }
};

const mapDispatchToProps = dispatch => (
    bindActionCreators({
        addloader,
        removeloader,
        modifyerror
    }, dispatch)
);

export default connect(mapStateToProps, mapDispatchToProps)(Notifications);