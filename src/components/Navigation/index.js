import React from 'react';
import { Link } from 'react-router-dom';

import { AuthUserContext } from '../Session';
import SignOutButton from '../SignOut';
import * as ROUTES from '../../constants/routes';
import * as ROLES from '../../constants/roles';

import './nav.css';

class AddCourseButton extends React.Component {
    constructor(props) {
        super(props);
        this.openLink = this.openLink.bind(this);
    }

    openLink() {
        const url = 'https://forms.gle/8TztemWeQnrG7WGN9';
        window.open(url, '_blank');
    }
    
    render() {
        return (
            <button className="navigationbutton" type="button" onClick={this.openLink}>
                Add a course
            </button>
        );
    }
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

function MenuItem(props) {
    return (
        <li id="special">
            <Link to={props.link}>{props.name}</Link>
        </li>
    );
}

const NavigationAuth = ({ authUser }) => (
    <div>
        <ul>
            {/* <li className="left">
                <Link to={ROUTES.LANDING}>Modulus</Link>
            </li> */}
            <li className="left">
                <AddCourseButton />
            </li>
            <li>
                <SignOutButton />
            </li>
            <MenuItem link={ROUTES.ACCOUNT} name="Account" />
            <MenuItem link={ROUTES.HOME} name="Dashboard" />
            
            {authUser.roles.includes(ROLES.ADMIN) && (
                <li>
                    <Link to={ROUTES.ADMIN}>Admin</Link>
                </li>
            )}
            
        </ul>
    </div>

);

const NavigationNonAuth = () => (
    <ul>
        {/* <li className="left">
                <Link to={ROUTES.LANDING}>Modulus</Link>
        </li> */}
        <MenuItem link={ROUTES.ACCOUNT} name="Sign In" />
    </ul>
);

export default Navigation;