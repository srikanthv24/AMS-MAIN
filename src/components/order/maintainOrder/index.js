import React from 'react';
import './maintainOrder.scss';
import classNames from 'classnames/bind';

import axios from 'axios';
import { toast } from 'react-toastify';
import { rootURL, ops } from '../../../config';

import Form from '../../common/form';
import ToggleBound from '../../common/togglebound';
import Pagination from '../../common/pagination';
import PageSizeSelector from '../../common/pagesizeselector';

import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { addloader, removeloader, modifyerror, modifywarning } from '../../../store/actions';
import { getorders } from '../../../store/viewsactions/order';


let
    searchFormElems = [
        {
            name: 'Search order',
            placeholder: 'Search order by no. order, packing sheet, police no, status',
            value: '',
            errMsg: '',
            required: true,
            valid: false,
            field: {
                type: "text"
            },
            gridClass: "col-12 col-md-12 col-lg-6",
            check: [
                {
                    regex: "^.{2,}$",
                    message: "Should be atleast 2 characters"
                }
            ]
        }
    ];

class MaintainOrder extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            inbound: true,
            SortOrder: "",
            PageSize: 10,
            PageNumber: 1,
            keyword: ""
        };
        this.getOrders();
    }

    async searchFormSubmit(data) {
        await this.setState({ keyword: data[0].value, PageNumber: 1 });
        this.getOrders();
        this.refs.searchFormRef.switchFormSubmit(false);
    }

    async resetSearch() {
        await this.setState({ keyword: "" });
        this.refs.searchFormRef.modifyFormObj(JSON.parse(JSON.stringify(searchFormElems)));
        this.getOrders();
    }

    async paginate(i) {
        await this.setState({ PageNumber: i });
        this.getOrders();
    }

    async sortTable(i) {
        await this.setState({ SortOrder: i });
        this.getOrders();
    }

    async rowsPerPageChange(i) {
        await this.setState({ PageSize: i, PageNumber: 1 });
        this.getOrders();
    }

    async toggleChange() {
        await this.setState({ inbound: !this.state.inbound, PageNumber: 1 });
        this.getOrders();
    }

    async deleteConfirm(id) {
        this.props.modifywarning({
            show: true,
            text: "Are you sure you want to cancel this order?",
            onClick: async () => {
                this.cancelOrder(id);
            }
        })
    }

    async cancelOrder(id) {
        let self = this;
        this.props.addloader('cancelOrder');

        await axios(rootURL + ops.order.cancelorder, {
            method: 'POST',
            headers: {
                "Content-Type": "application/json",
                "Token": this.props.credentials.TokenKey
            },
            data: JSON.stringify({
                "Requests": [
                    {

                        "OrderNumber": id
                    }
                ],
                "RequestFrom": "Sysytem"
            })
        })
            .then(function (response) {
                if (response.statusText === "OK") {
                    if (response.data.Status === "Success") {
                        toast.success(response.data.StatusMessage);
                        self.getOrders();
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

        this.props.removeloader('cancelOrder');

    }

    getOrders() {
        this.props.getorders({
            "Requests": [
                {
                    "OrderType": this.state.inbound ? 1 : 2
                }
            ],
            "SortOrder": this.state.SortOrder,
            "PageSize": this.state.PageSize,
            "PageNumber": this.state.PageNumber,
            "GlobalSearch": this.state.keyword
        });
    }

    render() {
        let
            searchFormButtons =
                <React.Fragment>
                    <button className="text-uppercase btn btn-primary submit-button px-sm-5 px-md-5 px-lg-5 mt-0" type="submit">Search</button>
                    {
                        this.state.keyword &&
                        <button className="btn btn-outline-danger reset-button p-2 ml-3 d-flex justify-content-between align-items-center" type="button" onClick={() => this.resetSearch()}><div className="text-truncate text-w">{this.state.keyword}</div><i className="fas fa-times"></i></button>
                    }
                </React.Fragment>,
            { credentials } = this.props,
            menuCodes = Boolean(credentials.RoleData) ? credentials.RoleData[0].RoleMenus.find(x => x.MenuCode === "M0002").RoleMenuActivities : [];
        return (
            <React.Fragment>
                <div className="MaintainOrder">
                    <div className="text-right">
                        <ToggleBound toggle={this.state.inbound} onClick={() => this.toggleChange()} />
                    </div>
                    <div className="tabs-wrap">
                        <div className="tabs-header-wrap">
                            <div className="tabs-title d-none d-md-block d-lg-block active">Maintain Order</div>
                            <div className="clearfix"></div>
                        </div>
                        <div className="tabs-content">

                            <Form
                                fields={JSON.parse(JSON.stringify(searchFormElems))}
                                className="search-form px-2"
                                footerClassName="col-12 col-md-12 col-lg-6 d-flex"
                                formButtons={searchFormButtons}
                                onSubmit={obj => this.searchFormSubmit(obj)}
                                ref="searchFormRef"
                            />

                            <div className="table-header-block d-flex flex-wrap mt-4 align-items-center">
                                <h5 className="px-2 font-weight-bold table-heading m-0">Order List</h5>
                                {
                                    menuCodes.find(x => x.ActivityCode === "A0001") &&
                                    <React.Fragment>
                                        <button type="button" className="btn btn-primary btn-sm ml-2 px-3 search-button ml-auto" onClick={() => this.props.history.push('/order/uploadOrder')}>UPLOAD ORDER</button>
                                        <button className="btn btn-outline-primary add-button p-2 ml-3 ml-sm-3 ml-md-3 ml-lg-3" onClick={() => this.props.history.push('/order/createOrder')}><i className="fas fa-plus"></i></button>
                                    </React.Fragment>
                                }
                            </div>

                            <PageSizeSelector NumberOfRecords={this.props.ordersTable.NumberOfRecords} value={this.state.PageSize} onChange={x => this.rowsPerPageChange(x)} />

                            <div className="table-cover table-responsive px-2 mt-4">
                                <table className="table">
                                    <thead>
                                        <tr>
                                            <th scope="col"></th>
                                            <th scope="col">No. Order</th>
                                            <th scope="col">Asal Pengiriman</th>
                                            <th scope="col">Tujuan Pengiriman</th>
                                            <th scope="col">Vehicle Type</th>
                                            <th scope="col">Expedition Name</th>
                                            <th scope="col">Nomor Polisi</th>
                                            <th scope="col">Status Order</th>

                                        </tr>
                                    </thead>
                                    <tbody>

                                        {
                                            Boolean(this.props.ordersTable.NumberOfRecords) ?
                                                this.props.ordersTable.Data.map((x, i) =>
                                                    <tr key={x.OrderId}>
                                                        <td className={classNames( 
                                                        "row-actions d-flex align-items-center", { "border-top-0": !i })}>
                                                          {
                                                            menuCodes.find(x => x.ActivityCode === "A0002") &&
                                                            <button type="button" className={classNames("btn rounded-circle circular-icon d-flex align-items-center justify-content-center p-0 border-0", { "disabled": !x.IsOrderEditable })}  onClick={() => x.IsOrderEditable ? this.deleteConfirm(x.OrderNumber) : null}>
                                                               <img src={require("../../../img/orders/cancel_order.png")} className="text-secondary img-fluid role-delete" />
                                                            </button>}
                                                           
                                                            {
                                                                menuCodes.find(x => x.ActivityCode === "A0003") &&
                                                                <button type="button" className="btn rounded-circle ml-2 circular-icon d-flex align-items-center justify-content-center" onClick={() => this.props.history.push({ pathname: '/order/createOrder', params: { order: x, mode: "view" } })}>
                                                                    <i className="fas fa-eye text-secondary role-delete"></i>
                                                                </button>
                                                            }
                                                            {
                                                                menuCodes.find(x => x.ActivityCode === "A0002") &&
                                                                <button type="button" className={classNames("btn ml-2 rounded-circle circular-icon d-flex align-items-center justify-content-center", { "disabled": !x.IsOrderEditable })} onClick={() => x.IsOrderEditable ? this.props.history.push({ pathname: '/order/createOrder', params: { order: x, mode: "edit" } }) : null}>
                                                                    <i className="fas fa-pencil-alt text-secondary role-delete"></i>
                                                                </button>
                                                            }
                                                            <button type="button" onClick={() => this.props.history.push({ pathname: '/order/trackOrder', params: { order: x } })} className="btn btn-primary btn-sm ml-2 px-3 search-button w-120">Track Order</button>
                                                        </td>
                                                        <td>{x.OrderNumber}</td>
                                                        <td>{x.Source}</td>
                                                        <td>{x.Destination}</td>
                                                        <td>{x.VehicleType}</td>
                                                        <td>{x.ExpeditionName}</td>
                                                        <td>{x.PoliceNumber}</td>
                                                        <td>{x.OrderStatus}</td>
                                                    </tr>
                                                ) :
                                                <tr><td className="text-center" colSpan="6">No records found</td></tr>
                                        }

                                    </tbody>
                                </table>

                            </div>
                            <Pagination PageSize={this.state.PageSize} PageNumber={this.state.PageNumber} NumberOfRecords={this.props.ordersTable.NumberOfRecords} onClick={i => this.paginate(i)} />


                        </div>
                    </div>
                </div>
            </React.Fragment>
        );
    }
}

const mapStateToProps = (state) => {
    let { credentials, views } = state,
        { order } = views,
        { ordersTable } = order;
    return { credentials, ordersTable }
};

const mapDispatchToProps = dispatch => (
    bindActionCreators({
        addloader,
        removeloader,
        modifyerror,
        modifywarning,
        getorders
    }, dispatch)
);

export default connect(mapStateToProps, mapDispatchToProps)(MaintainOrder);