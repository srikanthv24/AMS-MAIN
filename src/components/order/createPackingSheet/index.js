import React from 'react';
import './createPackingSheet.scss';
import classNames from 'classnames/bind';

import { browserHistory } from 'react-router';

import { FormElem } from '../../common/form';

import axios from 'axios';
import { toast } from 'react-toastify';
import { rootURL, ops } from '../../../config';

import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { addloader, removeloader, modifyerror } from '../../../store/actions';
import { getorderids } from '../../../store/viewsactions/order';

import { getShippingListGuids } from '../util.js';

let
    uploadFormElems = [
        {
            name: 'Order No.',
            value: [],
            errMsg: '',
            required: true,
            valid: false,
            field: {
                type: "typehead",
                labelKey: "Value",
                options: []
            }
        },
        {
            name: 'Notes',
            placeholder: '',
            value: '',
            errMsg: '',
            required: false,
            valid: true,
            field: {
                type: "text"
            },
            check: [
                {
                    regex: "^.{2,200}$",
                    message: "Should be 2 - 200 characters"
                }
            ]
        }
    ],
    rowObjs = [
        {
            name: 'Kode Dealer',
            value: '',
            errMsg: '',
            required: true,
            valid: false,
            field: {
                type: "select",
                options: [
                    {
                        label: 'Select an option',
                        value: ''
                    }
                ]
            },
            check: [
                {
                    regex: '^[0-9]+$',
                    message: "Please select an option"
                }
            ]
        },
        {
            name: 'Shipping List No.',
            placeholder: '',
            value: '',
            errMsg: '',
            required: true,
            valid: false,
            field: {
                type: "text"
            },
            check: [
                {
                    regex: "^.{2,20}$",
                    message: "Should be 2 - 20 characters"
                },
                {
                    regex: '^[a-zA-Z0-9]{2,20}$',
                    message: "Should not have any special characters or spaces"
                }
            ]
        },
        {
            name: 'Collie',
            placeholder: '',
            value: '',
            errMsg: '',
            required: true,
            valid: false,
            field: {
                type: "text"
            },
            check: [
                {
                    regex: "^.{1,10}$",
                    message: "Should be 1 - 10 digits"
                },
                {
                    regex: '^[0-9]{1,10}$',
                    message: "Collie should be integer/whole number"
                }
            ]
        },
        {
            name: 'Keterangan',
            placeholder: '',
            value: '',
            errMsg: '',
            required: false,
            valid: true,
            field: {
                type: "text"
            },
            check: [
                {
                    regex: "^.{2,200}$",
                    message: "Should be 2 - 200 characters"
                }
            ]
        },
        {
            name: 'Packing Sheet No.',
            placeholder: '',
            value: '',
            errMsg: '',
            required: true,
            valid: false,
            field: {
                type: "text"
            },
            check: [
                {
                    regex: "^.{2,50}$",
                    message: "Should be 2 - 50 characters"
                },
                {
                    regex: '^[a-zA-Z0-9]{2,20}$',
                    message: "Should not have any special characters or spaces"
                }
            ]
        }
    ];

class CreatePackingSheet extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            dealers: [],
            formObj: JSON.parse(JSON.stringify(uploadFormElems)),
            rows: [this.getRowArr()],
            
            formSubmitted: false,
            orderIDsFlag: false,
            shipListGUID: []
        };

        props.getorderids(this.failure);
    }

    failure = async () => {
        this.props.history.push('/order');
    }

    componentDidMount() {
        this.componentInitCheck()
    }

    componentDidUpdate() {
        this.componentInitCheck()
    }

    async componentInitCheck() {
        if (!this.state.orderIDsFlag && this.props.orderIDs.Data.length) {
            let { formObj } = this.state;

            formObj[0].field.options = this.props.orderIDs.Data.filter(x => x.Value);

            this.setState({ formObj, orderIDsFlag: true });

            if (this.props.location.params) {
                this.getPackingSheetDetails(this.props.location.params.orderId, true);
               
            }
        }
    }

    /* VIEW MODE FUNCTIONS START */

    async getPackingSheetDetails(orderID, disabled, OrderNumber) {
     
      
        let self = this;
        this.props.addloader('getOrderUploadDetails');

        await axios(rootURL + ops.order.getpackingsheetdetails + "?orderId=" + orderID, {
            method: 'GET',
            headers: {
                "Content-Type": "application/json",
                "Token": this.props.credentials.TokenKey
            }
        })
            .then(function (response) {
            
                if (response.statusText === "OK" && response.data.StatusMessage === "Success") {
                    if (response.data.NumberOfRecords > 0) {
                        self.packingSheetDetailsPopulate(response.data, disabled);
                     
                        getShippingListGuids((OrderNumber || self.props.location.params.order.OrderNumber), self.props.credentials.TokenKey, self.props.addloader, self.props.removeloader)
                            .then(res => {
                            
                                 self.setState({ shipListGUID: res });
                            })
                    } 
                     else{
                        getShippingListGuids((OrderNumber), self.props.credentials.TokenKey, self.props.addloader, self.props.removeloader)
                            .then(res => {
                            
                                 self.setState({ shipListGUID: res });
                            })
                     }
                }
                else {
                   
                    if (disabled) {
                        self.props.modifyerror({ show: true });
                    }
                }
            })
            .catch(function (error) {
                if (disabled) {
                    self.props.modifyerror({ show: true });
                    console.log("error", error)
                }
            });

        this.props.removeloader('getOrderUploadDetails');
    }

    async packingSheetDetailsPopulate(obj, disabled) {
        let { formObj, rows } = this.state;

        if(obj.Data.length === 0){
            formObj[1].value = '';
            formObj[1].valid = Boolean(formObj[1].value);
            formObj[1].disabled = disabled;
        } else {
        formObj[0].value = this.props.orderIDs.Data.filter(x => x.Value === obj.Data[0].OrderNumber);
        formObj[0].valid = Boolean(formObj[0].value);
        formObj[0].disabled = disabled;

        formObj[1].value = obj.Data[0].Notes;
        formObj[1].valid = Boolean(formObj[1].value);
        formObj[1].disabled = disabled;
        
        }
        if (disabled) {
            await this.tripChange(formObj[0], disabled);
        }

        rows = obj.Data.map((x, i) => {
            let row = this.getRowArr(),
                { dealers } = this.state,
                options = dealers.map(y => { return { value: y.DealerId, label: y.DealerNumber } }),
                optionMatch = dealers.find(y => y.DealerId === x.DealerId);

            row[0].value = optionMatch ? optionMatch.DealerId : "";
            row[0].valid = Boolean(row[0].value);
            row[0].disabled = disabled;
            row[0].field.options = [row[0].field.options[0], ...options];

            row[1] = optionMatch;

            row[2].value = x.ShippingListNo;
            row[2].valid = Boolean(row[2].value);
            row[2].disabled = disabled;

            row[3].value = x.Collie.toString();
            row[3].valid = (row[3].value != null && row[3].value != "");
            row[3].disabled = disabled;

            row[4].value = x.Katerangan;
            row[4].disabled = disabled;

            row[5] = x.PackingSheetNumbers ? x.PackingSheetNumbers.map((y, i) => {
                let packRow = Object.assign([], rowObjs[4]);

                packRow.value = y.Value;
                packRow.valid = Boolean(packRow.value);
                packRow.disabled = disabled;

                return packRow;
            }) : [rowObjs[4]]

            return row;
        });

        this.setState({ formObj, rows });
      
    }

    /* VIEW MODE FUNCTIONS END */

    async tripChange(obj, disabled) {
        await this.setState({ formObj: Object.assign([], this.state.formObj, [obj]) });

        if (obj.value[0]) {

            let self = this;
            this.props.addloader('getTripDealerList');

            await axios(rootURL + ops.order.getdealers + "?orderId=" + obj.value[0].Id, {
                method: 'GET',
                headers: {
                    "Content-Type": "application/json",
                    "Token": this.props.credentials.TokenKey
                }
            })
                .then(function (response) {
                    if (response.statusText === "OK" && response.data.Status === "Success") {
                        if (response.data.NumberOfRecords === 0) {
                            self.modifyerror({
                                show: true,
                                heading: "Data missing!",
                                text: "Data is missing for 'Kode Dealer' options for this 'Trip No.'. Please create the related entries first or select another 'Trip No.' to proceed."
                            });
                        }
                        else {
                            let { formobj } = self.state.formObj;
                               // self.state.formObj[1].value = '';
                                self.state.shipListGUID = [];
                            let { rows } = self.state,
                                newRows = rows.map(row => {
                                    row[0].value = "";
                                    row[1] = {};
                                    row[0].field.options = [row[0].field.options[0], ...response.data.Data.map(x => { return { value: x.DealerId, label: x.DealerNumber } })];
                                    return row
                                });

                            self.setState({ rows: newRows, dealers: response.data.Data });
                            if (!disabled) {
                                self.getPackingSheetDetails(obj.value[0].Id, false, obj.value[0].Value)
                            }
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

            this.props.removeloader('getTripDealerList');
        }
        else {
            this.setState({ rows: [this.getRowArr()], dealers: [] });
        }
    }

    handleRowChange(obj, i, ...arr) {
        let { rows } = this.state;

        if (arr.length === 1) {
            rows[i][arr[0]] = obj;
        }
        else {
            rows[i][arr[0]][arr[1]] = obj;
        }

        if (arr[0] === 0) {
            rows[i][1] = this.state.dealers.find(x => (x.DealerId == obj.value));
            if (!rows[i][1]) {
                rows[i][1] = {};
            }
        }

        this.setState({ rows });
    }

    getRowArr() {
        return JSON.parse(JSON.stringify([
            rowObjs[0],
            {},
            rowObjs[1],
            rowObjs[2],
            rowObjs[3],
            [rowObjs[4]]
        ]));
    }

    getFormObj() {
        return this.state.formObj[1].value;
    }

    addPackingSheet(index) {
        let { rows } = this.state;
        rows[index][5].push(Object.assign([], rowObjs[4]));
        this.setState({ rows });
    }

    addRow() {
        let { rows, dealers } = this.state,
            row = this.getRowArr();

        if (dealers && dealers.length) {
            row[0].field.options = [row[0].field.options[0], ...dealers.map(y => { return { value: y.DealerId, label: y.DealerNumber } })];
        }

        rows.push(row);
        this.setState({ rows });
    }

    async formSubmit() {
        let { formSubmitted, formObj, rows } = this.state,
            invalidCount = 0;

        if (!formSubmitted) {
            await this.setState({ formSubmitted: true });
        }

        formObj = formObj.map(x => {
            if (!x.valid) {
                invalidCount++;
                x.errMsg = "Required field"
            }
            return x
        });

        rows = rows.map(y => y.map((x, i) => {
            if (i !== 5) {
                if (i !== 1 && !x.valid) {
                    invalidCount++;
                    x.errMsg = "Required field"
                }
            }
            else {
                x = x.map(z => {
                    if (!z.valid) {
                        invalidCount++;
                        z.errMsg = "Required field"
                    }
                    return z
                })
            }
            return x
        }));

        this.setState({ formObj, rows });

        if (!invalidCount) {
            this.addPackingSheets();
        }
    }

    async addPackingSheets() {
        let { formObj, rows } = this.state,
            self = this;
        this.props.addloader('addPackingSheets');

        let body = {
            "Requests": [
            ],
            "CreatedBy": "System",
            "CreatedTime": new Date()
        };

        body.Requests = rows.map(x => {
            return {
                "OrderNumber": formObj[0].value[0].Id,
                "Notes": formObj[1].value,
                "DealerId": x[1].DealerId,
                "OrderDetailId": parseFloat(x[1].OrderDeatialId, 10),
                "ShippingListNo": x[2].value,
                "Collie": parseFloat(x[3].value, 10),
                "Katerangan": x[4].value,
                "PackingSheetNumbers": x[5].map(y => { return { "Id": 0, "Value": y.value } })
            }
        })

        await axios(rootURL + ops.order.createupdatepackingsheet, {
            method: 'POST',
            headers: {
                "Content-Type": "application/json",
                "Token": this.props.credentials.TokenKey
            },
            data: JSON.stringify(body)
        })
            .then(function (response) {
                if (response.statusText === "OK") {
                    if (response.data.Status === "Success") {
                        toast.success(response.data.StatusMessage);
                        self.props.history.push('/order');
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

        this.props.removeloader('addPackingSheets');
    }

    render() {
        let { formSubmitted } = this.state,
            viewFlag = !(this.props.location.params && this.props.location.params.mode === "view");
        return (
            <React.Fragment>
                <div className="PackingSheet">
                    <div className="tabs-wrap">
                        <div className="tabs-header-wrap">
                            <div className="tabs-title d-none d-md-block d-lg-block active">{viewFlag ? "Create" : "View"} Packing Sheet</div>
                            <div className="clearfix"></div>
                        </div>
                        <div className="tabs-content">

                            <div className="px-2">
                                <div className="row">
                                    <div className="form-group col-12 col-sm-6 col-md-4 col-lg-6">
                                        <FormElem
                                            formSubmitted={formSubmitted}
                                            elemObj={this.state.formObj[0]}
                                            handlechange={obj => this.tripChange(obj)}
                                        />
                                    </div>
                                    <div className="form-group col-12 col-md-6 col-lg-6">
                                        <FormElem
                                            formSubmitted={formSubmitted}
                                            elemObj={this.state.formObj[1]}
                                            handlechange={obj => this.setState({ formObj: Object.assign([], [this.state.formObj[0], obj]) })}
                                        />
                                    </div>
                                </div>
                                <div className="clearfix"></div>
                            </div>

                            <div className="table-cover table-responsive px-2 mt-5">
                                <table className="table">
                                    <thead>
                                        <tr>
                                            <th scope="col">No.</th>
                                            <th scope="col">Asal / Partner No.</th>
                                            <th scope="col">Nama</th>
                                            <th scope="col">Shipping List No.</th>
                                            <th scope="col">Collie</th>
                                            <th scope="col">Keterangan</th>
                                            <th scope="col">Packing Sheet No.</th>
                                            <th scope="col"></th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {
                                            this.state.rows.map((row, i) =>
                                                <tr key={i}>
                                                    <td>{i + 1}</td>
                                                    <td>
                                                        <FormElem
                                                            formSubmitted={formSubmitted}
                                                            elemObj={row[0]}
                                                            handlechange={obj => this.handleRowChange(obj, i, 0)}
                                                        />
                                                    </td>
                                                    <td>
                                                        <div className="input-group">
                                                            <input type="text" className="form-control" readOnly={true} value={row[1].DealerName ? row[1].DealerName : ""} />
                                                        </div>
                                                    </td>
                                                    <td>
                                                        <FormElem
                                                            formSubmitted={formSubmitted}
                                                            elemObj={row[2]}
                                                            handlechange={obj => this.handleRowChange(obj, i, 2)}
                                                        />
                                                    </td>
                                                    <td>
                                                        <FormElem
                                                            formSubmitted={formSubmitted}
                                                            elemObj={row[3]}
                                                            handlechange={obj => this.handleRowChange(obj, i, 3)}
                                                        />
                                                    </td>
                                                    <td>
                                                        <FormElem
                                                            formSubmitted={formSubmitted}
                                                            elemObj={row[4]}
                                                            handlechange={obj => this.handleRowChange(obj, i, 4)}
                                                        />
                                                    </td>
                                                    <td className="packingSheetsWrap">
                                                        {
                                                            row[5].map((ps, j) =>
                                                                <FormElem
                                                                    formSubmitted={formSubmitted}
                                                                    elemObj={ps}
                                                                    handlechange={obj => this.handleRowChange(obj, i, 5, j)}
                                                                />
                                                            )
                                                        }
                                                    </td>
                                                    {
                                                        viewFlag &&
                                                        <td className="valign_b" colSpan={row[5].length}>
                                                            <button className="text-uppercase btn btn-primary search-button mt-0 mb-2" type="button" onClick={() => this.addPackingSheet(i)}>Add Row</button>
                                                        </td>
                                                    }
                                                </tr>
                                            )
                                        }

                                    </tbody>
                                </table>

                            </div>

                            {
                                viewFlag &&
                                <div className="row m-0 py-4">
                                    <div className="col-12 col-md-12 col-lg-12 text-center">
                                        <button className="btn btn-outline-primary add-button p-2 ml-auto" type="button" onClick={() => this.addRow()}><i className="fas fa-plus"></i></button>
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
                    <div className="row m-0">
                        <div className="col-12 col-sm-12 col-md-12 col-lg-12 p-0 py-4">
                            {
                                viewFlag &&
                                <button className="text-uppercase btn btn-success save-button mb-2 px-5" type="submit" onClick={() => this.formSubmit()}>SAVE</button>
                            }
                            <button className="text-uppercase btn btn-danger save-button mb-2 px-5 ml-4" type="button" onClick={() => viewFlag ? this.props.history.push('/order') : this.props.history.push({ pathname: '/order/createOrder', params: { order: this.props.location.params.order, mode: "view" } })}>CANCEL</button>
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
        { orderIDs } = order;
    return { credentials, orderIDs }
};

const mapDispatchToProps = dispatch => (
    bindActionCreators({
        addloader,
        removeloader,
        modifyerror,
        getorderids
    }, dispatch)
);

export default connect(mapStateToProps, mapDispatchToProps)(CreatePackingSheet);