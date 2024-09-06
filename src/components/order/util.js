import axios from 'axios';
import { rootURL, ops } from '../../config';

export async function getPhotoWithCustomerGuids(id, token, addLoad, remLoad) {
    let returnValue = null;
    addLoad('getPhotoWithCustomerGuids');

    await axios(rootURL + ops.order.getphotowithcustomerguids + "?orderNumber=" + id, {
        method: 'GET',
        headers: {
            "Content-Type": "application/json",
            "Token": token
        }
    })
        .then(response => {
            if (response.statusText === "OK" && response.data.Status === "Success") {
                returnValue = response.data.Data;
            }
        })
        .catch(error => {
            this.props.modifyerror({ show: true });
            console.log("error", error)
        });

    remLoad('getPhotoWithCustomerGuids');

    return returnValue;
}

export async function getPodGuids(id, token, addLoad, remLoad) {
    let returnValue = null;
    addLoad('getPodGuids');

    await axios(rootURL + ops.order.getpodguids + "?orderNumber=" + id, {
        method: 'GET',
        headers: {
            "Content-Type": "application/json",
            "Token": token
        }
    })
        .then(response => {
            if (response.statusText === "OK" && response.data.Status === "Success") {
                returnValue = response.data.Data;
            }
        })
        .catch(error => {
            this.props.modifyerror({ show: true });
            console.log("error", error)
        });

    remLoad('getPodGuids');

    return returnValue;
}

export async function getShippingListGuids(id, token, addLoad, remLoad) {
    let returnValue = null;
    addLoad('getShippingListGuids');

    await axios(rootURL + ops.order.getshippinglistguids + "?orderNumber=" + id, {
        method: 'GET',
        headers: {
            "Content-Type": "application/json",
            "Token": token
        }
    })
        .then(response => {
            if (response.statusText === "OK" && response.data.Status === "Success") {
                returnValue = response.data.Data;
            }
        })
        .catch(error => {
            this.props.modifyerror({ show: true });
            console.log("error", error)
        });

    remLoad('getShippingListGuids');

    return returnValue;
}