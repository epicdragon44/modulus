import React from 'react';

import { withFirebase } from '../Firebase';

const SignOutButton = ({ firebase }) => (
    <button className="navigationbutton" style={{height: "3em"}} type="button" onClick={firebase.doSignOut}>
        Sign Out
    </button>
);

export default withFirebase(SignOutButton);