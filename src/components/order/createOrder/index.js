import React from 'react';
import './createOrder.scss';
import classNames from 'classnames/bind';

import ToggleBound from '../../common/togglebound';
import { Modal } from 'reactstrap';
import { roundTo } from '../../common/lib';

import axios from 'axios';
import { toast } from 'react-toastify';
import { rootURL, ops } from '../../../config';

import { Typeahead } from 'react-bootstrap-typeahead';
import 'react-bootstrap-typeahead/css/Typeahead.css';
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import Form from '../../common/form';

import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { addloader, removeloader, modifyerror } from '../../../store/actions';
import { getpartnerslist1, getpartnerslist2, getpartnerslist3, getfleettypes, getvehicletypes, modifydrivernames, getdrivernames, getregioncodes, getvehiclesplatenumbers } from '../../../store/viewsactions/order';

import { getPhotoWithCustomerGuids, getPodGuids } from '../util.js';

let
    uploadFormElems = [
        {
            name: 'Order No.',
            placeholder: '',
            value: '',
            errMsg: '',
            required: false,
            valid: true,
            disabled: true,
            field: {
                type: "text"
            },
            gridClass: "d-none",
            check: [
                {
                    regex: "^.{0,}$",
                    message: ""
                }
            ]
        },
        {
            name: 'PO/SO Number',
            placeholder: '',
            value: '',
            errMsg: '',
            required: false,
            valid: true,
            field: {
                type: "text"
            },
            gridClass: "col-12 col-lg-6",
            check: [
                {
                    regex: "^.{2,10}$",
                    message: "Should be 2 - 10 characters"
                },
                {
                    regex: '^[a-zA-Z0-9]{2,10}$',
                    message: "PO/SO number should not have any special characters or spaces"
                }
            ]
        },
        {
            name: 'Tipe Muatan',
            value: '',
            errMsg: 'Please select an option',
            required: true,
            valid: false,
            field: {
                type: "radio",
                horizontal: true,
                options: []
            },
            gridClass: "col-12 col-lg-6"
        },
        {
            name: 'Tipe Kendaraan',
            value: [],
            required: true,
            valid: false,
            field: {
                type: "typehead",
                labelKey: "Value",
                options: [],
                onChange: null
            },
            gridClass: "col-12 col-lg-6"
        },
        {
            name: 'Nama Pengendara',
            value: [],
            required: true,
            valid: false,
            field: {
                type: "typehead",
                labelKey: "Value",
                options: []
            },
            gridClass: "col-12 col-lg-6"
        },
        {
            name: 'Estimated Total Pallet',
            label: {
                text: "cm",
                super: "3"
            },
            placeholder: '',
            value: '',
            errMsg: '',
            required: true,
            valid: false,
            field: {
                type: "label"
            },
            gridClass: "col-12 col-lg-6",
            check: [
                {
                    regex: "^.{1,10}$",
                    message: "Should be 1 - 10 digits"
                },
                {
                    regex: '^[0-9]{1,10}$',
                    message: "Estimated Total Pallet should be numerical"
                }
            ]
        },
        {
            name: 'Weight',
            label: {
                text: "kg"
            },
            placeholder: '',
            value: '',
            errMsg: '',
            required: true,
            valid: false,
            field: {
                type: "label"
            },
            gridClass: "col-12 col-lg-6",
            check: [
                {
                    regex: "^.{1,30}$",
                    message: "Should be 1 - 30 digits"
                },
                {
                    regex: "^[0-9]+([.][0-9]+)?$",
                    message: "Weight should be numerical"
                }
            ]
        },
        {
            name: 'Police Number',
            value: [],
            required: true,
            valid: false,
            field: {
                type: "typehead",
                labelKey: "Value",
                options: []
            },
            gridClass: "col-12 col-lg-6"
        },
        {
            name: 'Instruksi',
            placeholder: '',
            value: '',
            errMsg: '',
            required: true,
            valid: false,
            field: {
                type: "text"
            },
            gridClass: "col-12 col-lg-6",
            check: [
                {
                    regex: "^.{1,200}$",
                    message: "Should be 1 - 200 characters"
                }
            ]
        },
        {
            name: 'Harga',
            placeholder: '',
            value: '',
            errMsg: '',
            required: false,
            valid: true,
            disabled: false,
            field: {
                type: "currency"
            },
            gridClass: "col-12 col-lg-6",
            check: [
                {
                    regex: "^.{0,}$",
                    message: ""
                }
            ]
        },
        {
            name: 'Business Area',
            value: [],
            required: true,
            valid: false,
            field: {
                type: "typehead",
                labelKey: "Value",
                options: []
            },
            gridClass: "col-12 col-lg-6"
        },
        {
            name: 'Shipment Schedule',
            placeholder: '',
            value: '',
            guid: null,
            errMsg: 'Please upload an image',
            required: true,
            valid: false,
            field: {
                type: "text"
            },
            gridClass: "col-12 col-lg-6"
        }
    ];


class CreateOrder extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            isOpen: false,
            uploadErrors: [],
            responseError: "",
            inbound: true,
            partnerOneSelected: [],
            partnerOneDetails: {},
            partnerSource: {
                selected: [],
                details: {},
                actualDT: new Date(),
                estimatedDT: new Date()
            },
            partnerDestination: {
                selected: [],
                details: {},
                actualDT: new Date(),
                estimatedDT: new Date()
            },
            driversSet: "",
            plateNumbersSet: "",
            PackingSheetNo: "",
            rows: [{
                selected: [],
                details: {},
                actualDT: new Date(),
                estimatedDT: new Date()
            }],
            formSubmitted: false,
            dataFlag: false,
            editID: 0,
            dataNull: false,
            custGUID: [],
            podGUID: [],
            namaPengendaraID: null,
            policeNumberID: null,
            Harga: ""
        };

        this.getPartnerType(1);
        this.getPartnerType(2);
        this.getPartnerType(3);
        props.getfleettypes(this.failure);
        props.getvehicletypes(this.failure);
        props.getregioncodes(this.failure);

        this.getHarga = this.getHarga.bind(this);
    }

    failure = async () => {
        if (!this.state.dataNull) {
            await this.setState({ dataNull: true });
            this.props.history.push('/order/maintainorder');
        }
    }

    componentDidMount() {
        this.componentInitCheck()
    }

    componentDidUpdate() {
        this.componentInitCheck()
    }

    async componentInitCheck() {
        if (!this.state.dataFlag && this.props.partnersList1.Data.length && this.props.partnersList2.Data.length && this.props.partnersList3.Data.length && this.props.fleetTypes.Data.length && this.props.vehicleTypes.Data.length && this.props.regionCodes.Data.length) {
            await this.setState({ dataFlag: true });
            if (this.props.location.params) {
                this.getOrderDetails()
            }
            else {
                this.refs.formRef.modifyFormObj(await this.formCodeBuild());
            }
        }
        if ((this.props.location.params ? this.state.namaPengendaraID : true) && this.state.driversSet !== JSON.stringify(this.props.driverNames.Data)) {
            await this.setState({ driversSet: JSON.stringify(this.props.driverNames.Data) });
            let formObj = await this.refs.formRef.getFormState().form.slice();
            formObj[4].field.options = this.props.driverNames.Data.filter(x => Boolean(x.Value));
            formObj[4].value = formObj[4].field.options.filter(y => (y.Id == this.state.namaPengendaraID));
            formObj[4].valid = formObj[4].value.length === 1;
            this.refs.formRef.modifyFormElem(formObj[4], 4);
        }
        if ((this.props.location.params ? this.state.policeNumberID : true) && this.state.plateNumbersSet !== JSON.stringify(this.props.vehiclesplatenumbers.Data)) {
            await this.setState({ plateNumbersSet: JSON.stringify(this.props.vehiclesplatenumbers.Data) });
            let formObj = await this.refs.formRef.getFormState().form.slice();
            formObj[7].field.options = this.props.vehiclesplatenumbers.Data.filter(x => Boolean(x.Value));
            formObj[7].value = formObj[7].field.options.filter(y => (y.Id == this.state.policeNumberID));
            formObj[7].valid = formObj[7].value.length === 1;
            this.refs.formRef.modifyFormElem(formObj[7], 7);
        }
    }

    async formCodeBuild() {
        let formObj = await this.refs.formRef.getFormState().form.slice();

        formObj[2].field.options = this.props.fleetTypes.Data.map(x => x.Value);
        formObj[3].field.options = this.props.vehicleTypes.Data.filter(x => Boolean(x.Value));
        formObj[3].field.onChange = this.getHarga;
        formObj[10].field.options = this.props.regionCodes.Data.filter(x => Boolean(x.Value));
        formObj[11].field.type = "browsefotopdf";

        return formObj;
    }

    /* EDIT MODE FUNCTIONS START */

    async getOrderDetails() {
        let self = this,
            x = this.props.location.params.order;
        this.props.addloader('getOrderUploadDetails');

        await axios(rootURL + ops.order.getorderdetails + "?orderId=" + x.OrderId, {
            method: 'GET',
            headers: {
                "Content-Type": "application/json",
                "Token": this.props.credentials.TokenKey
            }
        })
            .then(async function (response) {
                if (response.statusText === "OK" && response.data.StatusMessage === "Success") {
                    self.orderDetailsPopulate(response.data);
                    console.log("console: CreateOrder -> getOrderDetails -> response.data", response.data)
                    Promise.all([
                        getPhotoWithCustomerGuids(response.data.OrderNo, self.props.credentials.TokenKey, self.props.addloader, self.props.removeloader),
                        getPodGuids(response.data.OrderNo, self.props.credentials.TokenKey, self.props.addloader, self.props.removeloader)
                    ]).then(res => {
                        self.setState({ custGUID: res[0], podGUID: res[1] });
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

        this.props.removeloader('getOrderUploadDetails');
    }

    async orderDetailsPopulate(obj) {
        console.log("console: CreateOrder -> orderDetailsPopulate -> obj.Harga.toString()", obj.Harga.toString())
        this.setState({ Harga: obj.Harga.toString() })
        let x = this.state,
            newFormObj = await this.formCodeBuild(),
            pSource = obj.SourceOrDestinations.find(z => (z.PeartnerType === 2)),
            pDestination = obj.SourceOrDestinations.find(z => (z.PeartnerType === 3)),
            newState = Object.assign({}, x,
                {
                    editID: obj.ID,
                    inbound: (obj.OrderType === 1),
                    partnerOneSelected: this.props.partnersList1.Data.filter(y => (y.Id === obj.Transporter.PartnerId)),
                    partnerOneDetails: { Address: obj.Transporter.Address },
                    partnerSource: {
                        selected: this.props.partnersList2.Data.filter(y => (y.Id === obj.SourceOrDestinations.find(z => (z.PeartnerType === 2)).PartnerId)),
                        details: {
                            Address: pSource.Address,
                            ProvinceName: pSource.ProvinceName,
                            CityName: pSource.CityName
                        },
                        actualDT: new Date(),
                        estimatedDT: new Date()
                    },
                    partnerDestination: {
                        selected: this.props.partnersList3.Data.filter(y => (y.Id === obj.SourceOrDestinations.find(z => (z.PeartnerType === 3)).PartnerId)),
                        details: {
                            Address: pDestination.Address,
                            ProvinceName: pDestination.ProvinceName,
                            CityName: pDestination.CityName
                        },
                        actualDT: new Date(),
                        estimatedDT: new Date()
                    },
                    PackingSheetNo: obj.IsPackingSheetAvailable,
                    namaPengendaraID: obj.DriverNo,
                    policeNumberID: obj.VehicleNo
                }
            ),
            rowsPartnerType = (newState.inbound ? 2 : 3),
            newRowsObj = obj.SourceOrDestinations.filter(y => (y.PeartnerType === rowsPartnerType)).map(y => {
                return {
                    selected: this.props[`partnersList${rowsPartnerType}`].Data.filter(z => (z.Id === y.PartnerId)),
                    details: {
                        Address: y.Address,
                        ProvinceName: y.ProvinceName,
                        CityName: y.CityName
                    },
                    actualDT: new Date(),
                    estimatedDT: new Date()
                }
            });

        newFormObj[0].value = obj.OrderNo;
        newFormObj[0].gridClass = "col-12 col-lg-6";

        newFormObj[1].value = obj.SOPONumber ? obj.SOPONumber : "";
        newFormObj[1].valid = true;

        newFormObj[2].value = this.props.fleetTypes.Data.find(x => (x.Id === obj.FleetType)).Value;
        newFormObj[2].valid = true;

        newFormObj[3].value = this.props.vehicleTypes.Data.filter(y => (y.Id == obj.VehicleShipmentType));
        newFormObj[3].valid = newFormObj[3].value.length === 1;

        newFormObj[5].value = obj.TotalPallet;
        newFormObj[5].valid = true;

        newFormObj[6].value = obj.OrderWeight;
        newFormObj[6].valid = true;

        newFormObj[8].value = obj.Instructions;
        newFormObj[8].valid = true;

        newFormObj[9].value = obj.Harga.toString();
        newFormObj[9].valid = true;

        newFormObj[10].value = this.props.regionCodes.Data.filter(y => (y.Id == obj.BusinessAreaId));
        newFormObj[10].valid = true;
        newFormObj[10].disabled = true;

        newFormObj[11].guid = obj.ShipmentScheduleImageGUID;
        newFormObj[11].valid = Boolean(newFormObj[11].guid);

        if (this.props.location.params.mode == "view") {
            newFormObj[0].disabled = true;
            newFormObj[1].disabled = true;
            newFormObj[2].disabled = true;
            newFormObj[3].disabled = true;
            newFormObj[4].disabled = true;
            newFormObj[5].disabled = true;
            newFormObj[6].disabled = true;
            newFormObj[7].disabled = true;
            newFormObj[8].disabled = true;
            newFormObj[9].disabled = true;
            newFormObj[11].disabled = true;

        }

        newState.rows = newRowsObj;

        await this.setState({ ...newState });
        this.refs.formRef.modifyFormObj(newFormObj);

        this.onPartnerOneChange(this.state.partnerOneSelected)
    }

    /* EDIT MODE FUNCTIONS END */

    getPartnerType(i) {
        this.props[`getpartnerslist${i}`]({
            "Requests": [
                {
                    "PartnerTypeId": i
                }
            ],
            "SortOrder": "",
            "GlobalSearch": ""
        }, this.failure);
    }

    toggleChange() {
        if (!this.props.location.params) {
            let { rows } = this.state,
                newRowObj = rows.map(x => Object.assign({}, x, { selected: [], details: {} }));
            this.setState({ inbound: !this.state.inbound, rows: newRowObj })
        }
    }

    async onPartnerOneChange(obj) {
        await this.setState({ partnerOneSelected: obj });
        this.getHarga();

        if (obj.length) {

            let self = this;
            this.props.addloader('onPartnerOneChange');

            await axios(rootURL + ops.order.getpartnerdetails + "?partnerId=" + obj[0].Id, {
                method: 'GET',
                headers: {
                    "Content-Type": "application/json",
                    "Token": this.props.credentials.TokenKey
                }
            })
                .then(function (response) {
                    if (response.statusText === "OK" && response.data.StatusMessage === "Success") {
                        self.setState({ partnerOneDetails: response.data.Data[0] });
                    }
                    else {
                        self.props.modifyerror({ show: true });
                    }
                })
                .catch(function (error) {
                    self.props.modifyerror({ show: true });
                    console.log("error", error)
                });

            this.props.removeloader('onPartnerOneChange');
            this.props.getdrivernames(obj[0].Id, this.failure);
            this.props.getvehiclesplatenumbers(obj[0].Id, this.failure);
        }
        else {
            await this.setState({ partnerOneDetails: {} });
            this.props.modifydrivernames({ Data: [] });
            this.setState({ namaPengendaraID: null })
        }
    }

    async onPartnerSrcDesChange(obj, pType) {
        await this.setState({ [pType]: Object.assign({}, this.state[pType], { selected: obj }) });

        if (obj.length) {

            let self = this;
            this.props.addloader('onPartnerSrcDesChange');

            await axios(rootURL + ops.order.getpartnerdetails + "?partnerId=" + obj[0].Id, {
                method: 'GET',
                headers: {
                    "Content-Type": "application/json",
                    "Token": this.props.credentials.TokenKey
                }
            })
                .then(function (response) {
                    if (response.statusText === "OK" && response.data.StatusMessage === "Success") {
                        self.setState({ [pType]: Object.assign({}, self.state[pType], { details: response.data.Data[0] }) });
                    }
                    else {
                        self.props.modifyerror({ show: true });
                    }
                })
                .catch(function (error) {
                    self.props.modifyerror({ show: true });
                    console.log("error", error)
                });

            this.props.removeloader('onPartnerSrcDesChange');
        }
        else {
            await this.setState({ [pType]: Object.assign({}, this.state[pType], { details: {} }) });
        }
    }

    partnerSrcDesDateChange(date, label, pType) {
        this.setState({ [pType]: Object.assign({}, this.state[pType], { [label]: date }) });
    }

    async onRowChange(obj, i) {
        let { rows } = this.state,
            objSelected = rows.find(x => (JSON.stringify(x.selected) == JSON.stringify(obj)));

        if (!objSelected) {
            rows[i].error = "";
            rows[i].selected = obj;

            if (obj[0]) {

                let self = this;
                this.props.addloader('onRowChange');

                await axios(rootURL + ops.order.getpartnerdetails + "?partnerId=" + obj[0].Id, {
                    method: 'GET',
                    headers: {
                        "Content-Type": "application/json",
                        "Token": this.props.credentials.TokenKey
                    }
                })
                    .then(function (response) {
                        if (response.statusText === "OK" && response.data.StatusMessage === "Success") {
                            rows[i].details = response.data.Data[0];
                            self.setState({ rows: rows });
                        }
                        else {
                            self.props.modifyerror({ show: true });
                        }
                    })
                    .catch(function (error) {
                        self.props.modifyerror({ show: true });
                        console.log("error", error)
                    });

                this.props.removeloader('onRowChange');
            }
        }
        else {
            rows[i].error = "Location already selected.";
        }

        await this.setState({ rows: rows });
    }

    rowDateChange(date, label, i) {
        let { rows } = this.state;

        rows[i][label] = date;

        this.setState({ rows });
    }

    addRow() {
        let { rows } = this.state;

        rows.push({
            selected: [],
            details: {},
            actualDT: new Date(),
            estimatedDT: new Date()
        });

        this.setState({ rows });
    }

    deleteRow(index) {
        let { rows } = this.state;

        rows = rows.filter((x, i) => (i != index));

        this.setState({ rows });
    }

    onEachSubmit() {
        this.setState({ formSubmitted: true });
    }

    async onFormSubmit(obj) {
        debugger
        if (obj[11].value) {
            let self = this,
                thisTimer = setInterval(function () {
                    if (obj[11].guid) {
                        clearInterval(thisTimer);
                        self.postOrderDetailsManual(obj);
                    }
                }, 50);
        }
        else {
            this.postOrderDetailsManual(obj);
        }
    }

    async postOrderDetailsManual(obj) {
        console.log("console: postOrderDetailsManual -> obj", obj)
        let self = this,
            x = self.state;

        if (x.partnerOneSelected[0] && Boolean(x.inbound ? x.partnerDestination.selected[0] : x.partnerSource.selected[0]) && !x.rows.find(j => !(j.selected[0] && j.actualDT && j.estimatedDT))) {
            this.props.addloader('postOrderDetailsManual');

            let body = {
                "Requests": [
                ],
                "UploadType": 2,
                "CreatedBy": "System",
                "CreatedTime": new Date()
            };

            let reqObjs = this.state.rows.map((row, i) => {
                let adt = new Date(row.actualDT),
                    edt = new Date(row.estimatedDT);
                return {
                    "ID": x.editID,
                    "BusinessAreaId": obj[10].value[0].Id,
                    "OrderNo": obj[0].value,
                    "SOPONumber": obj[1].value,
                    "SequenceNo": (10 * (i + 1)),
                    "PartnerNo1": x.partnerOneSelected[0].Id,
                    "PartnerType1": 1,
                    "PartnerNo2": (x.inbound ? row.selected[0].Id : x.partnerSource.selected[0].Id),
                    "PartnerType2": 2,
                    "PartnerNo3": (x.inbound ? x.partnerDestination.selected[0].Id : row.selected[0].Id),
                    "PartnerType3": 3,
                    "FleetType": this.props.fleetTypes.Data.find(x => (x.Value === obj[2].value)).Id,
                    "OrderType": (x.inbound ? 1 : 2),
                    "VehicleShipmentType": obj[3].value[0].Id,
                    "DriverNo": obj[4].value[0].Id,
                    "VehicleNo": obj[7].value[0].Id,
                    "OrderWeight": obj[6].value,
                    "OrderWeightUM": "KG",
                    // "SourceEstimationShipmentDate": "24.04.2019",
                    // "SourceEstimationShipmentTime": "15:00",
                    // "SourceActualShipmentDate": "24.04.2019",
                    // "SourceActualShipmentTime": "16:00",
                    "EstimationShipmentDate": `${roundTo(edt.getDate(), 2)}.${roundTo(edt.getMonth() + 1, 2)}.${roundTo(edt.getFullYear(), 4)}`,
                    "EstimationShipmentTime": `${roundTo(edt.getHours(), 2)}:${roundTo(edt.getMinutes(), 2)}`,
                    "ActualShipmentDate": `${roundTo(adt.getDate(), 2)}.${roundTo(adt.getMonth() + 1, 2)}.${roundTo(adt.getFullYear(), 4)}`,
                    "ActualShipmentTime": `${roundTo(adt.getHours(), 2)}:${roundTo(adt.getMinutes(), 2)}`,
                    "OrderShipmentStatus": 1,
                    "TotalPallet": obj[5].value,
                    "Instructions": obj[8].value,
                    "Harga": obj[9].value,
                    "ShipmentScheduleImageGUID": obj[11].guid
                }
            });

            body.Requests = reqObjs;

            await axios(rootURL + ops.order.createupdateorders, {
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
                        else if (response.data.Status === "Failure") {
                            self.setState({ isOpen: true, uploadErrors: response.data.Data, responseError: response.data.StatusMessage });
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

            this.props.removeloader('postOrderDetailsManual');
        }
    }

    async getHarga() {
        this.props.addloader('getHargaValue');
        let formObj = await this.refs.formRef.getFormState().form.slice();
        console.log("console: getHarga -> formObj", formObj)
        if (this.state.partnerOneSelected[0] && this.state.partnerOneSelected[0].Id && formObj[3].value[0] && formObj[3].value[0].Id) {
            console.log("console: getHarga -> getharga", rootURL + ops.order.getharga)
            await axios(rootURL + ops.order.getharga, {
                method: 'POST',
                headers: {
                    "Content-Type": "application/json",
                    "Token": this.props.credentials.TokenKey
                },
                data: JSON.stringify({
                    "Requests": [
                        {
                            "TransporterID": this.state.partnerOneSelected[0].Id,
                            "VechicleTypeID": formObj[3].value[0].Id
                        }
                    ]
                })
            })
                .then(response => {
                    if (response.statusText === "OK") {
                        if (response.data.Status === "Success") {

                            console.log("console: getHarga -> response.data.Data[0]", response.data.Data[0])
                            formObj[9].value = this.state.Harga;
                        }
                        else {
                            this.props.modifyerror({ show: true });
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
        }

        this.refs.formRef.modifyFormObj(formObj)

        this.props.removeloader('getHargaValue');
    }

    render() {
        return (
            <React.Fragment>
                <div className="PackingSheet">
                    <div className="text-right">
                        <ToggleBound toggle={this.state.inbound} onClick={() => this.toggleChange()} />
                    </div>
                    <div className="tabs-wrap">
                        <div className="tabs-header-wrap">
                            <div className="tabs-title d-none d-md-block d-lg-block active">{this.props.location.params ? this.props.location.params.mode : "Create"} Order</div>
                            <div className="clearfix"></div>
                        </div>
                        <div className="tabs-content">

                            <form className="upload-form px-2" onSubmit={e => e.preventDefault()}>
                                <div className="row">
                                    <div className="form-group col-12 col-md-6 col-lg-6">
                                        <label className="text-truncate">Nama Transporter<span className="text-danger font-weight-bold">*</span></label>
                                        <div className="position-relative">
                                            <Typeahead id="" labelKey="Value" options={this.props.partnersList1.Data} placeholder="Select an option" selected={this.state.partnerOneSelected} onChange={selected => this.onPartnerOneChange(selected)} disabled={this.props.location.params && this.props.location.params.mode == "view"} />
                                            <i className="fas fa-search text-secondary position-absolute" style={{ right: "10px", top: "12px" }}></i>
                                        </div>
                                        <small className="form-text text-danger">{(this.state.formSubmitted && !this.state.partnerOneSelected.length) && "Please select an option"}</small>
                                    </div>
                                    <div className="form-group col-12 col-md-6 col-lg-6">
                                        <label className="text-truncate">Alamat Transporter<span className="text-danger font-weight-bold">*</span></label>
                                        <input className="form-control" readOnly={true} value={this.state.partnerOneDetails.Address ? this.state.partnerOneDetails.Address : ""} />
                                    </div>
                                </div>
                            </form>

                            <div className="table-cover table-responsive position-relative px-2 mt-5">
                                <table className="table">
                                    <thead>
                                        <tr>
                                            <th></th>
                                            <th scope="col">Source</th>
                                            <th scope="col">Tempat</th>
                                            <th scope="col">Nama</th>
                                            <th scope="col">Alamat</th>
                                            <th scope="col">Provinsi</th>
                                            <th scope="col">Kota</th>
                                            <th scope="col">Tanggal Pengiriman</th>
                                            <th scope="col">Estimasi Pengiriman</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {
                                            !this.state.inbound &&
                                            <tr>
                                                <td>
                                                </td>
                                                <td>
                                                    <div className="form-group w_200 my-3">
                                                        <input type="text" className="form-control" readOnly={true} value="Asal" />
                                                    </div>
                                                </td>
                                                <td>
                                                    <div className="input-group w_200 my-3">
                                                        <div className="position-relative">
                                                            <Typeahead id="" labelKey="Value" options={this.props.partnersList2.Data} placeholder="Select an option" selected={this.state.partnerSource.selected} onChange={selected => this.onPartnerSrcDesChange(selected, "partnerSource")} disabled={this.props.location.params && this.props.location.params.mode == "view"} />
                                                            <i className="fas fa-search text-secondary position-absolute" style={{ right: "10px", top: "12px" }}></i>
                                                        </div>
                                                        <small className="form-text text-danger">{(this.state.formSubmitted && !this.state.partnerSource.selected.length) && "Please select an option"}</small>
                                                    </div>
                                                </td>
                                                <td>
                                                    <div className="form-group w_200 my-3">
                                                        <input type="text" className="form-control" readOnly={true} value={Boolean(this.state.partnerSource.selected.length) ? this.state.partnerSource.selected[0].Value : ""} />
                                                    </div>
                                                </td>
                                                <td>
                                                    <div className="form-group w_200 my-3">
                                                        <input type="text" className="form-control" readOnly={true} value={this.state.partnerSource.details.Address} />
                                                    </div>
                                                </td>
                                                <td>
                                                    <div className="form-group w_200 my-3">
                                                        <input type="text" className="form-control" readOnly={true} value={this.state.partnerSource.details.ProvinceName} />
                                                    </div>
                                                </td>
                                                <td>
                                                    <div className="form-group w_200 my-3">
                                                        <input type="text" className="form-control" readOnly={true} value={this.state.partnerSource.details.CityName} />
                                                    </div>
                                                </td>
                                                <td>
                                                    <div className="form-group w_200 my-3">
                                                        <DatePicker withPortal dateFormat="dd.MM.yyyy HH:mm" selected={this.state.partnerSource.actualDT} onChange={date => this.partnerSrcDesDateChange(date, "actualDT", "partnerSource")} showTimeSelect timeFormat="HH:mm" timeIntervals={15} timeCaption="time" className="form-control" disabled={this.props.location.params && this.props.location.params.mode == "view"} />
                                                        <small className="form-text text-danger">{(this.state.formSubmitted && !this.state.partnerSource.actualDT) && "Please specify a date & time"}</small>
                                                    </div>
                                                </td>
                                                <td>
                                                    <div className="form-group w_200 my-3">
                                                        <DatePicker withPortal dateFormat="dd.MM.yyyy HH:mm" selected={this.state.partnerSource.estimatedDT} onChange={date => this.partnerSrcDesDateChange(date, "estimatedDT", "partnerSource")} showTimeSelect timeFormat="HH:mm" timeIntervals={15} timeCaption="time" className="form-control" disabled={this.props.location.params && this.props.location.params.mode == "view"} />
                                                        <small className="form-text text-danger">{(this.state.formSubmitted && !this.state.partnerSource.estimatedDT) && "Please specify a date & time"}</small>
                                                    </div>
                                                </td>
                                            </tr>
                                        }

                                        {
                                            this.state.rows.map((row, i) =>
                                                <tr key={i}>
                                                    <td>
                                                        {
                                                            Boolean(!(this.props.location.params && this.props.location.params.mode == "view")) && (i > 0) &&
                                                            <button type="button" onClick={() => this.deleteRow(i)} className="btn rounded-circle circular-icon d-flex align-items-center justify-content-center my-3">
                                                                <i className="far fa-trash-alt text-secondary"></i>
                                                            </button>
                                                        }
                                                    </td>
                                                    <td>
                                                        <div className="form-group w_200 my-3">
                                                            <input type="text" className="form-control" readOnly={true} value={this.state.inbound ? "Asal" : "Tujuan"} />
                                                        </div>
                                                    </td>
                                                    <td>
                                                        <div className="input-group w_200 my-3">
                                                            <div className="position-relative">
                                                                <Typeahead id="" labelKey="Value" options={this.state.inbound ? this.props.partnersList2.Data : this.props.partnersList3.Data} placeholder="Select an option" selected={row.selected} onChange={selected => this.onRowChange(selected, i)} disabled={this.props.location.params && this.props.location.params.mode == "view"} />
                                                                <i className="fas fa-search text-secondary position-absolute" style={{ right: "10px", top: "12px" }}></i>
                                                            </div>
                                                            <small className="form-text text-danger">{row.error ? row.error : ((this.state.formSubmitted && !row.selected.length) && "Please select an option")}</small>
                                                        </div>
                                                    </td>
                                                    <td>
                                                        <div className="form-group w_200 my-3">
                                                            <input type="text" className="form-control" readOnly={true} value={Boolean(row.selected.length) ? row.selected[0].Value : ""} />
                                                        </div>
                                                    </td>
                                                    <td>
                                                        <div className="form-group w_200 my-3">
                                                            <input type="text" className="form-control" readOnly={true} value={row.details.Address ? row.details.Address : ""} />
                                                        </div>
                                                    </td>
                                                    <td>
                                                        <div className="form-group w_200 my-3">
                                                            <input type="text" className="form-control" readOnly={true} value={row.details.ProvinceName ? row.details.ProvinceName : ""} />
                                                        </div>
                                                    </td>
                                                    <td>
                                                        <div className="form-group w_200 my-3">
                                                            <input type="text" className="form-control" readOnly={true} value={row.details.CityName ? row.details.CityName : ""} />
                                                        </div>
                                                    </td>
                                                    <td>
                                                        <div className="form-group w_200 my-3">
                                                            <DatePicker withPortal dateFormat="dd.MM.yyyy HH:mm" selected={row.actualDT} onChange={date => this.rowDateChange(date, "actualDT", i)} showTimeSelect timeFormat="HH:mm" timeIntervals={15} timeCaption="time" className="form-control" disabled={this.props.location.params && this.props.location.params.mode == "view"} />
                                                            <small className="form-text text-danger">{(this.state.formSubmitted && !row.actualDT) && "Please specify a date & time"}</small>
                                                        </div>
                                                    </td>
                                                    <td>
                                                        <div className="form-group w_200 my-3">
                                                            <DatePicker withPortal dateFormat="dd.MM.yyyy HH:mm" selected={row.estimatedDT} onChange={date => this.rowDateChange(date, "estimatedDT", i)} showTimeSelect timeFormat="HH:mm" timeIntervals={15} timeCaption="time" className="form-control" disabled={this.props.location.params && this.props.location.params.mode == "view"} />
                                                            <small className="form-text text-danger">{(this.state.formSubmitted && !row.estimatedDT) && "Please specify a date & time"}</small>
                                                        </div>
                                                    </td>
                                                </tr>
                                            )
                                        }

                                        {
                                            this.state.inbound &&
                                            <tr>
                                                <td>
                                                </td>
                                                <td>
                                                    <div className="form-group w_200 my-3">
                                                        <input type="text" className="form-control" readOnly={true} value="Tujuan" />
                                                    </div>
                                                </td>
                                                <td>
                                                    <div className="input-group w_200 my-3">
                                                        <div className="position-relative">
                                                            <Typeahead id="" labelKey="Value" options={this.props.partnersList3.Data} placeholder="Select an option" selected={this.state.partnerDestination.selected} onChange={selected => this.onPartnerSrcDesChange(selected, "partnerDestination")} disabled={this.props.location.params && this.props.location.params.mode == "view"} />
                                                            <i className="fas fa-search text-secondary position-absolute" style={{ right: "10px", top: "12px" }}></i>
                                                        </div>
                                                        <small className="form-text text-danger">{(this.state.formSubmitted && !this.state.partnerDestination.selected.length) && "Please select an option"}</small>
                                                    </div>
                                                </td>
                                                <td>
                                                    <div className="form-group w_200 my-3">
                                                        <input type="text" className="form-control" readOnly={true} value={Boolean(this.state.partnerDestination.selected.length) ? this.state.partnerDestination.selected[0].Value : ""} />
                                                    </div>
                                                </td>
                                                <td>
                                                    <div className="form-group w_200 my-3">
                                                        <input type="text" className="form-control" readOnly={true} value={this.state.partnerDestination.details.Address} />
                                                    </div>
                                                </td>
                                                <td>
                                                    <div className="form-group w_200 my-3">
                                                        <input type="text" className="form-control" readOnly={true} value={this.state.partnerDestination.details.ProvinceName} />
                                                    </div>
                                                </td>
                                                <td>
                                                    <div className="form-group w_200 my-3">
                                                        <input type="text" className="form-control" readOnly={true} value={this.state.partnerDestination.details.CityName} />
                                                    </div>
                                                </td>
                                                <td>
                                                    <div className="form-group w_200 my-3">
                                                        <DatePicker withPortal dateFormat="dd.MM.yyyy HH:mm" selected={this.state.partnerDestination.actualDT} onChange={date => this.partnerSrcDesDateChange(date, "actualDT", "partnerDestination")} showTimeSelect timeFormat="HH:mm" timeIntervals={15} timeCaption="time" className="form-control" disabled={this.props.location.params && this.props.location.params.mode == "view"} />
                                                        <small className="form-text text-danger">{(this.state.formSubmitted && !this.state.partnerDestination.actualDT) && "Please specify a date & time"}</small>
                                                    </div>
                                                </td>
                                                <td>
                                                    <div className="form-group w_200 my-3">
                                                        <DatePicker withPortal dateFormat="dd.MM.yyyy HH:mm" selected={this.state.partnerDestination.estimatedDT} onChange={date => this.partnerSrcDesDateChange(date, "estimatedDT", "partnerDestination")} showTimeSelect timeFormat="HH:mm" timeIntervals={15} timeCaption="time" className="form-control" disabled={this.props.location.params && this.props.location.params.mode == "view"} />
                                                        <small className="form-text text-danger">{(this.state.formSubmitted && !this.state.partnerDestination.estimatedDT) && "Please specify a date & time"}</small>
                                                    </div>
                                                </td>
                                            </tr>
                                        }

                                    </tbody>
                                </table>
                            </div>

                            {
                                Boolean(!(this.props.location.params && this.props.location.params.mode == "view")) &&
                                <div className="row m-0 py-4">
                                    <div className="col-12 col-md-12 col-lg-12 text-center">
                                        <button className="btn btn-outline-primary add-button p-2 ml-auto" onClick={() => this.addRow()}><i className="fas fa-plus"></i></button>
                                    </div>
                                </div>
                            }

                            <div className="my-4">
                                <div className="px-2">
                                    <Form
                                        fields={JSON.parse(JSON.stringify(uploadFormElems))}
                                        className="upload-form px-2"
                                        footerClassName="d-none"
                                        onEachSubmit={() => this.onEachSubmit()}
                                        onSubmit={obj => this.onFormSubmit(obj)}
                                        ref="formRef"
                                    />
                                </div>
                            </div>

                            {
                                Boolean(this.state.PackingSheetNo && (this.props.location.params && this.props.location.params.mode === "view")) &&
                                <div className="row m-0 pb-4">
                                    <div className="col-12 col-md-12 col-lg-12">
                                        <button className="btn btn-primary" onClick={() => this.props.history.push({ pathname: '/order/createpackingsheet', params: { order: this.props.location.params.order, orderId: this.props.location.params.order.OrderId, mode: "view" } })}>View Packing Sheet</button>
                                    </div>
                                </div>
                            }

                            {
                                Boolean(this.props.location.params && Boolean(this.state.custGUID.length)) &&
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
                                Boolean(this.props.location.params && Boolean(this.state.podGUID.length)) &&
                                <div className="row m-0 pb-4">
                                    <h4 className="px-3">PoD Images</h4>
                                    <div className="col-12 col-md-12 col-lg-12">
                                        {
                                            this.state.podGUID.map((x, i) =>
                                                <a href="#" className="col-12 col-sm-6 col-md-4 col-lg-3" onClick={e => { e.preventDefault(); window.open(rootURL + ops.uploadMedia.downloadfile + "?fileguid=" + x.Guid, "Customer Photo", "width=800,height=600") }}>PoD {i + 1}</a>
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
                                (this.props.location.params && this.props.location.params.mode === "view") ?
                                    null :
                                    <button className="text-uppercase btn btn-success save-button px-5" type="submit" onClick={() => this.refs.formRef.onFormSubmit()}>SAVE</button>
                            }
                            <button className="text-uppercase btn btn-danger save-button px-5 ml-4" type="button" onClick={() => this.props.history.push('/order/maintainorder')}>CANCEL</button>
                        </div>
                    </div>
                </div>

                <Modal isOpen={this.state.isOpen} toggle={() => this.setState({ isOpen: false })} className="modal-dialog-centered file-upload-error-modal">
                    <div className="modal-body">
                        <div className="image-wrap text-center">
                            <img alt="Upload Failed" className="img-fluid" src={require("../../../img/upload_failed.svg")} />
                        </div>
                        {Boolean(this.state.responseError) &&
                            <h6 className="text-center mt-4">{this.state.responseError}</h6>
                        }
                        <ul className={classNames({ "pt-4": Boolean(!this.state.responseError) })}>
                            {
                                this.state.uploadErrors.map(x =>
                                    <li key={x.ErrorMessage}>{x.ErrorMessage}</li>
                                )
                            }
                        </ul>
                        <div className="modal-close-wrap text-center">
                            <button style={{ "backgroundColor": "#00539F", "borderRadius": "50px" }} onClick={() => this.setState({ isOpen: false })} className="btn btn-primary border-0">COBA LAGI</button>
                        </div>
                    </div>
                </Modal>
            </React.Fragment>
        );
    }
}

const mapStateToProps = (state) => {
    let { credentials, views } = state,
        { order } = views,
        { partnersList1, partnersList2, partnersList3, fleetTypes, vehicleTypes, driverNames, regionCodes, vehiclesplatenumbers } = order;
    return { credentials, partnersList1, partnersList2, partnersList3, fleetTypes, vehicleTypes, driverNames, regionCodes, vehiclesplatenumbers }
};

const mapDispatchToProps = dispatch => (
    bindActionCreators({
        addloader,
        removeloader,
        modifyerror,
        getpartnerslist1,
        getpartnerslist2,
        getpartnerslist3,
        getfleettypes,
        getvehicletypes,
        modifydrivernames,
        getdrivernames,
        getregioncodes,
        getvehiclesplatenumbers
    }, dispatch)
);

export default connect(mapStateToProps, mapDispatchToProps)(CreateOrder);