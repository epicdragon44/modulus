
import React from 'react';

import { AuthUserContext, withAuthorization } from '../Session';
import PasswordChangeForm from '../PasswordChange';

const AccountPage = () => (
    <AuthUserContext.Consumer>
        {authUser => (
            <div className="dialogwallpaper">
                <div className="content">
                        <h1> <br /> <br />Account Settings</h1> 
                        <h3>For {authUser.email}</h3> <br />
                    <PasswordChangeForm />
                </div>
            </div>
        )}
    </AuthUserContext.Consumer>
);

const condition = authUser => !!authUser;

export default withAuthorization(condition)(AccountPage);