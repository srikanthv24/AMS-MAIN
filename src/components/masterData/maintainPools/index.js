import React from 'react';
import './maintainPools.scss';
import classNames from 'classnames/bind';

import axios from 'axios';
import { toast } from 'react-toastify';
import { rootURL, ops } from '../../../config';

import Form from '../../common/form';
import Pagination from '../../common/pagination';
import PageSizeSelector from '../../common/pagesizeselector';

import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { addloader, removeloader, modifyerror, modifywarning } from '../../../store/actions';
import { getpools } from '../../../store/viewsactions/masterData';

let
    searchFormElems = [
        {
            name: 'Search Pools',
            placeholder: 'Search by pools',
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

class MaintainPools extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            SortOrder: "",
            PageSize: 10,
            PageNumber: 1,
            keyword: ""
        };
        this.getPools();
    }

    async searchFormSubmit(data) {
        await this.setState({ keyword: data[0].value, PageNumber: 1 });
        this.getPools();
        this.refs.searchFormRef.switchFormSubmit(false);
    }

    async resetSearch() {
        await this.setState({ keyword: "" });
        this.refs.searchFormRef.modifyFormObj(JSON.parse(JSON.stringify(searchFormElems)));
        this.getPools();
    }

    async paginate(i) {
        await this.setState({ PageNumber: i });
        this.getPools();
    }

    async sortTable(i) {

        let key = "";
        switch (this.state.SortOrder) {
            case i:
                key = `${i}_desc`;
                break;
            case `${i}_desc`:
                key = '';
                break;
            default:
                key = i;
        }

        await this.setState({ SortOrder: key });
        this.getPools();
    }

    async rowsPerPageChange(i) {
        await this.setState({ PageSize: i, PageNumber: 1 });
        this.getPools();
    }

    async deleteConfirm(id) {
        this.props.modifywarning({
            show: true,
            text: "Are you sure you want to delete this entry?",
            onClick: async () => {
                this.deletePool(id);
            }
        })
    }

    async deletePool(id) {
        let self = this;
        this.props.addloader('deletePool');

        await axios(rootURL + ops.pool.deletepool + "?poolID=" + id, {
            method: 'DELETE',
            headers: {
                "Content-Type": "application/json",
                "Token": this.props.credentials.TokenKey
            }
        })
            .then(function (response) {
                if (response.statusText === "OK") {
                    if (response.data.Status === "Success") {
                        toast.success(response.data.StatusMessage);
                        self.getPools();
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

        this.props.removeloader('deletePool');

    }

    getPools() {
        this.props.getpools({
            "Requests": [
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
            menuCodes = Boolean(credentials.RoleData) ? credentials.RoleData[0].RoleMenus.find(x => x.MenuCode === "M0003").RoleMenuActivities : [];
        return (
            <React.Fragment>
                <div className="MaintainPool">
                    <div className="tabs-wrap">
                        <div className="tabs-header-wrap">
                            <div className="tabs-title d-none d-md-block d-lg-block active">Maintain Pools</div>
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

                            <div className="table-header-block d-flex mt-4 align-items-center">
                                <h5 className="px-2 font-weight-bold table-heading m-0">Pools List</h5>
                                {
                                    menuCodes.find(x => x.ActivityCode === "A0004") &&
                                    <button className="btn btn-outline-primary add-button p-2 ml-auto" onClick={() => this.props.history.push('/masterdata/createPools')}><i className="fas fa-plus"></i></button>
                                }
                            </div>

                            <PageSizeSelector NumberOfRecords={this.props.poolsTable.NumberOfRecords} value={this.state.PageSize} onChange={x => this.rowsPerPageChange(x)} />

                            <div className="table-cover table-responsive px-2 mt-4">
                                <table className="table">
                                    <thead>
                                        <tr>
                                            <th scope="col"></th>
                                            <th scope="col" style={{ "cursor": "pointer" }} onClick={() => this.sortTable("poolname")}>{(this.state.SortOrder.indexOf("poolname") === 0) && <i className={"mr-2 fas fa-sort-" + ((this.state.SortOrder === "poolname") ? "down" : "up")}></i>}Nama Pool</th>
                                            <th scope="col" style={{ "cursor": "pointer" }} onClick={() => this.sortTable("poolcode")}>{(this.state.SortOrder.indexOf("poolcode") === 0) && <i className={"mr-2 fas fa-sort-" + ((this.state.SortOrder === "poolcode") ? "down" : "up")}></i>}Kode</th>
                                            <th scope="col" style={{ "cursor": "pointer" }} onClick={() => this.sortTable("contactnumber")}>{(this.state.SortOrder.indexOf("contactnumber") === 0) && <i className={"mr-2 fas fa-sort-" + ((this.state.SortOrder === "contactnumber") ? "down" : "up")}></i>}Nomor Kontak</th>
                                            <th scope="col" style={{ "cursor": "pointer" }} onClick={() => this.sortTable("address")}>{(this.state.SortOrder.indexOf("address") === 0) && <i className={"mr-2 fas fa-sort-" + ((this.state.SortOrder === "address") ? "down" : "up")}></i>}Alamat</th>
                                            <th scope="col" style={{ "cursor": "pointer" }} onClick={() => this.sortTable("city")}>{(this.state.SortOrder.indexOf("city") === 0) && <i className={"mr-2 fas fa-sort-" + ((this.state.SortOrder === "city") ? "down" : "up")}></i>}Kota</th>

                                        </tr>
                                    </thead>
                                    <tbody>
                                        {
                                            Boolean(this.props.poolsTable.NumberOfRecords) ?
                                                this.props.poolsTable.Data.map((x, i) =>
                                                    <tr key={x.ID}>

                                                        <td className={classNames("row-actions d-flex align-items-center", { "border-top-0": !i })}>
                                                            {
                                                                menuCodes.find(x => x.ActivityCode === "A0007") &&
                                                                <button type="button" onClick={() => this.deleteConfirm(x.ID)} className="btn rounded-circle mr-2 circular-icon d-flex align-items-center justify-content-center">
                                                                    <i className="far fa-trash-alt text-secondary"></i>
                                                                </button>
                                                            }
                                                            {
                                                                menuCodes.find(x => x.ActivityCode === "A0005") &&
                                                                <button type="button" onClick={() => this.props.history.push({ pathname: '/masterdata/createPools', params: { pools: x } })} className="btn rounded-circle circular-icon d-flex align-items-center justify-content-center">
                                                                    <i className="fas fa-pencil-alt text-secondary"></i>
                                                                </button>
                                                            }
                                                        </td>
                                                        <td>{x.PoolName}</td>
                                                        <td>{x.PoolDescription}</td>
                                                        <td>{x.ContactNumber}</td>
                                                        <td>{x.Address}</td>
                                                        <td>{x.CityName}</td>
                                                    </tr>
                                                ) :
                                                <tr><td className="text-center" colSpan="6">No records found</td></tr>
                                        }
                                    </tbody>
                                </table>

                            </div>
                            <Pagination PageSize={this.state.PageSize} PageNumber={this.state.PageNumber} NumberOfRecords={this.props.poolsTable.NumberOfRecords} onClick={i => this.paginate(i)} />



                        </div>
                    </div>
                </div>
            </React.Fragment>
        );
    }
}

const mapStateToProps = (state) => {
    let { credentials, views } = state,
        { masterData } = views,
        { poolsTable } = masterData;
    return { credentials, poolsTable }
};

const mapDispatchToProps = dispatch => (
    bindActionCreators({
        addloader,
        removeloader,
        modifyerror,
        modifywarning,
        getpools
    }, dispatch)
);

export default connect(mapStateToProps, mapDispatchToProps)(MaintainPools);