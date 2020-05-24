import React from 'react';
import { Link } from 'react-router-dom';

import { AuthUserContext } from '../Session';
import SignOutButton from '../SignOut';
import * as ROUTES from '../../constants/routes';
import * as ROLES from '../../constants/roles';

import './nav.css';

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

function MenuItem(props) {
    return (
        <li>
            <Link to={props.link}>{props.name}</Link>
        </li>
<<<<<<< Updated upstream
    );
}

const NavigationAuth = ({ authUser }) => (
    <div>
        <ul>
            <li className="left">
                <Link to={ROUTES.LANDING}>Modulus</Link>
            </li>
            <MenuItem link={ROUTES.HOME} name="Dashboard" />
            <MenuItem link={ROUTES.ACCOUNT} name="Account" />
            {/*{authUser.roles.includes(ROLES.ADMIN) && (*/}
            {/*    <li>*/}
            {/*        <Link to={ROUTES.ADMIN}>Admin</Link>*/}
            {/*    </li>*/}
            {/*)}*/}
            <li>
                <SignOutButton />
            </li>
        </ul>
    </div>
=======
        {authUser.roles.includes(ROLES.ADMIN) && (
            <li>
                <Link to={ROUTES.ADMIN}>Admin</Link>
            </li>
        )}
        <li>
            <SignOutButton />
        </li>
    </ul>
>>>>>>> Stashed changes
);

const NavigationNonAuth = () => (
    <ul>
        <li className="left">
                <Link to={ROUTES.LANDING}>Modulus</Link>
        </li>
        <MenuItem link={ROUTES.ACCOUNT} name="Sign In" />
    </ul>
);

export default Navigation;