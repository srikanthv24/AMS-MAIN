import React from "react";
import { BrowserRouter as Router, Route, Switch, Redirect } from "react-router-dom";

import Layout from './components/common/layout';
import Login from './components/login';
import Loader, { StaticLoader } from './components/common/loader';
import Error from './components/common/error';
import Warning from './components/common/warning';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import { connect } from 'react-redux';

import routes from './routes.json';

class RouteStack extends React.Component {
    constructor(props) {
        super(props);
        this.state = { authStack: null };
    }

    componentDidMount() {
        this.initCheck()
    }

    componentDidUpdate() {
        this.initCheck()
    }

    initCheck() {
        let { authStack } = this.state;
        if (!authStack && this.props.credentials.TokenKey) {
            authStack = routes.routes.filter(x => x.code && (this.props.credentials.RoleData[0].RoleMenus.find(y => y.MenuCode === x.code) || x.code === "allow")).map(x => {
                return <Route key={x.name} exact={x.exact} path={x.path} component={Layout} />
            });
            this.setState({ authStack });
        }
    }

    render() {
        let initRoute = this.props.credentials.RoleData ? routes.routes.find(x => Boolean(this.props.credentials.RoleData[0].RoleMenus.find(y => x.code === y.MenuCode))).sidebarLink : '/dashboard',
            { authStack } = this.state;
        return (
            <Router>
                <React.Suspense fallback={StaticLoader}>
                    <Switch>
                        <Route exact path="/login/:redirectTo?" component={Login}></Route>
                        {authStack}
                        <Redirect from="/toNotifications" to={'/login/notifications'} />
                        <Redirect to={this.props.credentials.TokenKey ? initRoute : '/login'} />
                    </Switch>
                </React.Suspense>
                <Loader />
                <Error />
                <Warning />
                <ToastContainer />
            </Router>
        )
    }
}

const mapStateToProps = state => {
    let { credentials } = state;
    return { credentials }
};

export default connect(mapStateToProps)(RouteStack);