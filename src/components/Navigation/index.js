import React from 'react';
import { Link } from 'react-router-dom';
import logo from './inversemodulus.png';

import { AuthUserContext } from '../Session';
import SignOutButton from '../SignOut';
import * as ROUTES from '../../constants/routes';
import * as ROLES from '../../constants/roles';

import dashboard from './dashboard.png';
import account from './account.png'; 

import './nav.css';

function Logo() {
    return (
        <div className="logo" >
            <img className="logo" src={logo} alt="Modulus Logo" />
        </div>
    )
}

const Navigation = () => (
    <AuthUserContext.Consumer>
        {authUser =>
            authUser ? (
                <NavigationAuth authUser={authUser} />
            ) : (
                <NavigationNonAuth />
            )
        }
    </AuthUserContext.Consumer>
);

function DashboardMenuItem(props) {
    return (
        <li className="nav" id="special">
            <Link to={props.link}><img src={dashboard} alt="dashboard" height="20px"></img></Link>
        </li>
    );
}

function AccountMenuItem(props) {
    return (
        <li className="nav" id="special">
            <Link to={props.link}><img src={account} alt="account" height="20px"></img></Link>
        </li>
    );
}

function MenuItem(props) {
    return (
        <li className="nav" id="special">
            <Link to={props.link}><img src={account} alt="account" height="20px"></img></Link>
        </li>
    );
}

const NavigationAuth = ({ authUser }) => (
    <div>
        <ul className="nav">
            {/* <li className="left">
                <Link to={ROUTES.LANDING}>Modulus</Link>
            </li> */}
            <li className="left">
                <Logo />
            </li>
            <li className="nav">
                <SignOutButton />
            </li>
            <AccountMenuItem link={ROUTES.ACCOUNT} />
            <DashboardMenuItem link={ROUTES.HOME} />
            
            {/* {authUser.roles.includes(ROLES.ADMIN) && (
                <li>
                    <Link to={ROUTES.ADMIN}>Admin</Link>
                </li>
            )} */}
            
        </ul>
    </div>

);

const NavigationNonAuth = () => (
    <ul className="nav">
        <li className="left">
                <Logo />
            </li>
        <MenuItem link={ROUTES.ACCOUNT} name="Sign In" />
    </ul>
);

export default Navigation;