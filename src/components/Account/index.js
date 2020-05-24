
import React from 'react';

import { AuthUserContext, withAuthorization } from '../Session';
import PasswordChangeForm from '../PasswordChange';
import { PieChart } from 'react-minimal-pie-chart';

function VarkProfile(props) {
    const lineWidth = 60;
    return (
        <div className="varkprofile">
            <PieChart
                style={{
                    fontFamily:
                    '"Nunito Sans", -apple-system, Helvetica, Arial, sans-serif',
                    fontSize: '8px',
                    height: "150px",
                }}
                data={[
                    {
                        color: 'red',
                        title: 'V',
                        value: props.Vcnt,
                    },
                    {
                        color: 'blue',
                        title: 'A',
                        value: props.Acnt,
                    },
                    {
                        color: 'green',
                        title: 'R',
                        value: props.Rcnt,
                    },
                    {
                        color: 'purple',
                        title: 'K',
                        value: props.Kcnt,
                    },
                ]}
                radius={PieChart.defaultProps.radius - 6}
                lineWidth={60}
                segmentsStyle={{ transition: 'stroke .3s', cursor: 'pointer' }}
                animate
                label={({ dataEntry }) => Math.round(dataEntry.percentage) + '%'}
                labelPosition={100 - lineWidth / 2}
                labelStyle={{
                    fill: '#fff',
                    opacity: 0.75,
                    pointerEvents: 'none',
                }}
            />
        </div>
    );
}

function AccountPage(props) {
    const usr = JSON.parse(localStorage.getItem('authUser'));
    var values = Object.values(usr).slice()[6];
    var Vcnt = 0;
    var Acnt = 0;
    var Rcnt = 0;
    var Kcnt = 0;
    var varkLetter;
    for (varkLetter of values) {
        if (varkLetter==="V") {
            Vcnt++;
        }
        if (varkLetter==="A") {
            Acnt++;
        }
        if (varkLetter==="R") {
            Rcnt++;
        }
        if (varkLetter==="K") {
            Kcnt++;
        }
    }

    var varkProfile = (
        <VarkProfile 
            Vcnt={Vcnt}
            Acnt={Acnt}
            Rcnt={Rcnt}
            Kcnt={Kcnt}
        />
    );

    return (
        <AuthUserContext.Consumer>
            {authUser => (
                <div class="dialogwallpaper">
                    <div class="largecontent">
                        <center>
                            <h1><br /> <br />Your VARK Profile</h1> 
                            <p className="widespace">Based on what you clicked on within courses,<br /> we estimated your learning style preferences.</p> <br />
                            <table className="offsetleft">
                                <tr>
                                    <td>
                                        {varkProfile}
                                    </td>
                                    <td>
                                        <p style={{color: "red"}}>Visual</p>
                                        <p style={{color: "blue"}}>Auditory</p>
                                        <p style={{color: "green"}}>Reading/Writing</p>
                                        <p style={{color: "purple"}}>Kinesthetic</p>
                                    </td>
                                </tr>
                            </table>
                            
                        </center>
                        
                        <center>
                            {/* <p style={{color: "red"}}>Visual: Learns best through diagrams and charts</p>
                            <p style={{color: "blue"}}>Auditory: Learns best through videos and lectures</p>
                            <p style={{color: "green"}}>Reading/Writing: Learns best through reading and writing</p>
                            <p style={{color: "purple"}}>Kinesthetic: Learns best through touching and testing</p> */}
                            <br />
                            {/* <p className="widespace">All students learn in different ways, and by knowing your VARK Profile,<br /> you can invest in courses that match your preferred education. </p> */}
                            <p className="widespace">To learn more about the different learning models, visit <a className="nonformatted" href="https://vark-learn.com/">the VARK site</a>.<br />You can also take their <a className="nonformatted" href="https://vark-learn.com/the-vark-questionnaire/">quiz</a> and see how closely it matches your profile here.</p>
                            <br /> <br /><br /> <br />
                        </center>
                    </div>
                    <div class="largecontent">
                        <center>
                            <h1> <br /> <br />Change Password</h1> 
                            <h3>For {authUser.email}</h3> <br />
                        </center>
                        <PasswordChangeForm />
                    </div>
                    <br />
                    <br />
                    <br />
                    <br />
                    <br />
                </div>
            )}
        </AuthUserContext.Consumer>
    );
}

const condition = authUser => !!authUser;

export default withAuthorization(condition)(AccountPage);