import React from 'react';
import './trackOrder.scss';
import classNames from 'classnames/bind';

import axios from 'axios';
import { toast } from 'react-toastify';
import { rootURL, ops } from '../../../config';

import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { addloader, removeloader, modifyerror } from '../../../store/actions';

import { getShippingListGuids, getPhotoWithCustomerGuids, getPodGuids } from '../util.js';

class TrackOrder extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            trackingData: {},
            custGUID: [],
            podGUID: [],
            shipListGUID: []
        }
        if (!props.location.params) {
            props.history.push('/order');
        }
        this.getTrackingOrder();
    }


    async getTrackingOrder() {
        let self = this,
            order = this.props.location.params.order;

        this.props.addloader('getTrackingOrder');

        await axios(rootURL + ops.order.trackorder + "?orderId=" + order.OrderId, {
            method: 'GET',
            headers: {
                "Content-Type": "application/json",
                "Token": this.props.credentials.TokenKey
            }
        })
            .then(function (response) {
                if (response.statusText === "OK") {
                    self.setState({ trackingData: response.data });
                    Promise.all([
                        getPhotoWithCustomerGuids(order.OrderNumber, self.props.credentials.TokenKey, self.props.addloader, self.props.removeloader),
                        getPodGuids(order.OrderNumber, self.props.credentials.TokenKey, self.props.addloader, self.props.removeloader),
                        getShippingListGuids(order.OrderNumber, self.props.credentials.TokenKey, self.props.addloader, self.props.removeloader)
                    ]).then(res => {
                        self.setState({ custGUID: res[0], podGUID: res[1], shipListGUID: res[2] });
                    })
                }
                else {
                    self.props.modifyerror({ show: true });
                }
            })
            .catch(function (error) {
                self.props.modifyerror({ show: true });
                console.log("error", error)
            });

        this.props.removeloader('getTrackingOrder');

    }

    render() {

        let trackingDataObj = this.state.trackingData.Data;

        return (
            <React.Fragment>
                <div className="TrackOrder">
                    <div className="tabs-wrap">
                        <div className="tabs-header-wrap">
                            <div className="tabs-title d-none d-md-block d-lg-block active">Tracking Order</div>
                            <div className="clearfix"></div>
                        </div>
                        <div className="tabs-content clearfix">
                            <div className="refresh-wrap">
                                <button className="btn btn-outline-primary py-2 px-3" onClick={() => this.getTrackingOrder()}><i className="fas fa-sync-alt mr-2"></i>Refresh</button>
                            </div>
                            <div className="order-progress pb-4 clearfix">

                                {
                                    this.state.trackingData.Data ?

                                        <ul className="progressbar-y list-unstyled clearfix">

                                            <li className={classNames("vertical-list non-list", { "inactive": !Boolean(trackingDataObj.AcceptOrder.StepHeaderDateTime) }, { "b-inactive": !Boolean(trackingDataObj.Loads[0].StartTrip.StepHeaderDateTime) })}>
                                                <div className="text-left pl-5 pb-5">
                                                    <div className="main-title-y">{trackingDataObj.AcceptOrder.StepHeaderName}</div>
                                                    <div className="sub-title-y">{trackingDataObj.AcceptOrder.StepHeaderDescription}</div>
                                                    <div className="date-y text-secondary">{trackingDataObj.AcceptOrder.StepHeaderDateTime}</div>
                                                </div>
                                            </li>

                                            {
                                                trackingDataObj.Loads.map((x, i, arr) =>
                                                    <li className={classNames("vertical-list", { "inactive": !Boolean(x.StartTrip.StepHeaderDateTime) }, { "b-inactive": ((i < (arr.length - 1)) ? !Boolean(arr[i + 1].StartTrip.StepHeaderDateTime) : !Boolean(trackingDataObj.Unloads[0].StartTrip.StepHeaderDateTime)) })} key={i}>
                                                        <div className="text-left pl-5 pb-5">
                                                            <div className="main-title-y">{x.TrackLoadUnloadName}<span className="badge badge-pill badge-bg ml-4 px-3">{x.StepHeaderNotification}</span></div>
                                                            <div className="horizontal-bar">
                                                                <ul className="progressbar-x list-unstyled clearfix">
                                                                    <li className={classNames({ "inactive": !Boolean(x.StartTrip.StepHeaderDateTime) })}>
                                                                        <div className="main-title">{x.StartTrip.StepHeaderName}</div>
                                                                        <div className="sub-title">{x.StartTrip.StepHeaderDescription}</div>
                                                                        <div className="date text-secondary">{x.StartTrip.StepHeaderDateTime}</div>
                                                                    </li>
                                                                    <li className={classNames({ "inactive": !Boolean(x.ConfirmArrive.StepHeaderDateTime) })}>
                                                                        <div className="main-title">{x.ConfirmArrive.StepHeaderName}</div>
                                                                        <div className="sub-title">{x.ConfirmArrive.StepHeaderDescription}</div>
                                                                        <div className="date text-secondary">{x.ConfirmArrive.StepHeaderDateTime}</div>
                                                                    </li>
                                                                    <li className={classNames({ "inactive": !Boolean(x.StartLoad.StepHeaderDateTime) })}>
                                                                        <div className="main-title">{x.StartLoad.StepHeaderName}</div>
                                                                        <div className="sub-title">{x.StartLoad.StepHeaderDescription}</div>
                                                                        <div className="date text-secondary">{x.StartLoad.StepHeaderDateTime}</div>
                                                                    </li>
                                                                    <li className={classNames({ "inactive": !Boolean(x.FinishLoad.StepHeaderDateTime) })}>
                                                                        <div className="main-title">{x.FinishLoad.StepHeaderName}</div>
                                                                        <div className="sub-title">{x.FinishLoad.StepHeaderDescription}</div>
                                                                        <div className="date text-secondary">{x.FinishLoad.StepHeaderDateTime}</div>
                                                                    </li>
                                                                </ul>
                                                            </div>
                                                        </div>
                                                    </li>
                                                )
                                            }

                                            {
                                                trackingDataObj.Unloads.map((x, i, arr) =>
                                                    <li className={classNames("vertical-list", { "inactive": !Boolean(x.StartTrip.StepHeaderDateTime) }, { "b-inactive": ((i < (arr.length - 1)) ? !Boolean(arr[i + 1].StartTrip.StepHeaderDateTime) : !Boolean(trackingDataObj.POD.StepHeaderDateTime)) })} key={i}>
                                                        <div className="text-left pl-5 pb-5">
                                                            <div className="main-title-y">{x.TrackLoadUnloadName}<span className="badge badge-pill badge-bg ml-4 px-3">{x.StepHeaderNotification}</span></div>
                                                            <div className="horizontal-bar">
                                                                <ul className="progressbar-x list-unstyled clearfix">

                                                                    <li className={classNames({ "inactive": !Boolean(x.StartTrip.StepHeaderDateTime) })}>
                                                                        <div className="main-title">{x.StartTrip.StepHeaderName}</div>
                                                                        <div className="sub-title">{x.StartTrip.StepHeaderDescription}</div>
                                                                        <div className="date text-secondary">{x.StartTrip.StepHeaderDateTime}</div>
                                                                    </li>
                                                                    <li className={classNames({ "inactive": !Boolean(x.ConfirmArrive.StepHeaderDateTime) })}>
                                                                        <div className="main-title">{x.ConfirmArrive.StepHeaderName}</div>
                                                                        <div className="sub-title">{x.ConfirmArrive.StepHeaderDescription}</div>
                                                                        <div className="date text-secondary">{x.ConfirmArrive.StepHeaderDateTime}</div>
                                                                    </li>
                                                                    <li className={classNames({ "inactive": !Boolean(x.StartLoad.StepHeaderDateTime) })}>
                                                                        <div className="main-title">{x.StartLoad.StepHeaderName}</div>
                                                                        <div className="sub-title">{x.StartLoad.StepHeaderDescription}</div>
                                                                        <div className="date text-secondary">{x.StartLoad.StepHeaderDateTime}</div>
                                                                    </li>
                                                                    <li className={classNames({ "inactive": !Boolean(x.FinishLoad.StepHeaderDateTime) })}>
                                                                        <div className="main-title">{x.FinishLoad.StepHeaderName}</div>
                                                                        <div className="sub-title">{x.FinishLoad.StepHeaderDescription}</div>
                                                                        <div className="date text-secondary">{x.FinishLoad.StepHeaderDateTime}</div>
                                                                    </li>
                                                                </ul>
                                                            </div>
                                                        </div>
                                                    </li>
                                                )
                                            }

                                            <li className={classNames("vertical-list non-list", { "inactive": !Boolean(trackingDataObj.POD.StepHeaderDateTime) })}>
                                                <div className="text-left pl-5 pb-5">
                                                    <div className="main-title-y">{trackingDataObj.POD.StepHeaderName}</div>
                                                    <div className="sub-title-y">{trackingDataObj.POD.StepHeaderDescription}</div>
                                                    <div className="date-y text-secondary">{trackingDataObj.POD.StepHeaderDateTime}</div>
                                                </div>
                                            </li>

                                            <li className={classNames("vertical-list non-list", { "inactive": !Boolean(trackingDataObj.Complete.StepHeaderDateTime) })}>
                                                <div className="text-left pl-5 pb-5">
                                                    <div className="main-title-y">{trackingDataObj.Complete.StepHeaderName}</div>
                                                    <div className="sub-title-y">{trackingDataObj.Complete.StepHeaderDescription}</div>
                                                    <div className="date-y text-secondary">{trackingDataObj.Complete.StepHeaderDateTime}</div>
                                                </div>
                                            </li>
                                        </ul>

                                        : <p>No records found</p>
                                }

                            </div>

                            {
                                Boolean(this.state.custGUID.length) &&
                                <div className="row m-0 pb-4">
                                    <h4 className="px-3">Customer Photos</h4>
                                    <div className="col-12 col-md-12 col-lg-12">
                                        {
                                            this.state.custGUID.map((x, i) =>
                                                <a href="#" className="col-12 col-sm-6 col-md-4 col-lg-3" onClick={e => { e.preventDefault(); window.open(rootURL + ops.uploadMedia.downloadfile + "?fileguid=" + x.Guid, "Customer Photo", "width=800,height=600") }}>Customer Photo {i + 1}</a>
                                            )
                                        }
                                    </div>
                                </div>
                            }

                            {
                                Boolean(this.state.podGUID.length) &&
                                <div className="row m-0 pb-4">
                                    <h4 className="px-3">PoD Images</h4>
                                    <div className="col-12 col-md-12 col-lg-12">
                                        {
                                            this.state.podGUID.map((x, i) =>
                                                <a href="#" className="col-12 col-sm-6 col-md-4 col-lg-3" onClick={e => { e.preventDefault(); window.open(rootURL + ops.uploadMedia.downloadfile + "?fileguid=" + x.Guid, "PoD Photo", "width=800,height=600") }}>PoD {i + 1}</a>
                                            )
                                        }
                                    </div>
                                </div>
                            }

                            {
                                Boolean(this.state.shipListGUID.length) &&
                                <div className="row m-0 pb-4">
                                    <h4 className="px-3">Shipping Lists</h4>
                                    <div className="col-12 col-md-12 col-lg-12">
                                        {
                                            this.state.shipListGUID.map((x, i) =>
                                                <a href="#" className="col-12 col-sm-6 col-md-4 col-lg-3" onClick={e => { e.preventDefault(); window.open(rootURL + ops.uploadMedia.downloadfile + "?fileguid=" + x.Guid, "Shipping List", "width=800,height=600") }}>Shipping List {i + 1}</a>
                                            )
                                        }
                                    </div>
                                </div>
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

export default connect(mapStateToProps, mapDispatchToProps)(TrackOrder);