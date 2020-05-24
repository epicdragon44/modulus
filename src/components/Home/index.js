import React from 'react';
import logo from './logowithtext.svg';
import './App.css';
import { withAuthorization } from '../Session';

import * as firebase from 'firebase'
require('@firebase/database');


function Logo() {
    return (
        <div class="logo" >
            <br />
            <img width="100%" src={logo} alt="Modulus Logo" />
        </div>
    )
}

function CourseListItem(props) {
    return (
        <div className="courselistitem" onClick={() => {props.changeActiveCourse(props.name);}} >
            {props.name}
        </div>
    );
}

function AddCourseItem(props) {
    return (
        <div class="addcourseitem" onClick={props.addCourseMode}>
            +
        </div>
    );
}

class Sidebar extends React.Component { //the entire left sidebar
    constructor(props) {
        super(props);
        this.state = {
            username: props.username,
            activeCourse: props.activeCourse,
            arrCourses: props.arrCourses,
        }
    }

    //utility functions to pass info up to container
    changeActiveCourse = (name) => {this.props.changeActiveCourse(name);}
    addCourseMode = () => {this.props.addCourseMode();}

    render() {
        return (
            <div>
<div className="sidebar">
                <Logo />
                 <div class="sidebarheader"><p><b>Your courses:</b></p></div>
                <div class="courselist">
                   {this.props.arrCourses.map(course => <CourseListItem name={course} active={(this.props.activeCourse===course ? "active" : "")} changeActiveCourse={this.changeActiveCourse}/>)}
                   <AddCourseItem addCourseMode={this.addCourseMode}/>
                </div>
            </div>
            </div>
            
        );
    }
}

function ModuleContentItem(props) {
    const [openedStatus, open] = React.useState("");

    let precede;
    if (openedStatus==="active") {
        precede = openedStatus;
    } else {
        precede = props.vark;
    }

    var attribute = precede+"modulecontentitem"
    return (
        <div className={attribute} onClick={() => open("active")}>
            {props.name}
        </div>
    );
}

function ModuleItem(props) {
    const [active, setActive] = React.useState(props.active);

    var attribute = active+"moduleitem";
    return (
        <div className={attribute} >
            <div class="moduletitle" onClick={() => setActive(active==="active" ? "" : "active")}>
                {props.name}
            </div>
            <div class="modulecontents">
                {props.contents.map(contentitem => <ModuleContentItem name={contentitem} vark={props.vark[props.contents.indexOf(contentitem)]}/>)}
            </div>
        </div>
    );
}

class MainPanel extends React.Component { //the entire right half of the screen where all the modules are

    render() { //active: "" means the module is minimized, "active" means its expanded

        var welcomeMsg;
        if (this.props.activeCourse==="none") {
            welcomeMsg = "Select or add a course on the left to get started.";
        } else {
            welcomeMsg = "Welcome to " + (this.props.activeCourse);

        }

        return (
            <div class="mainpanel">
                {/* <div class="varkguide">
                    <div class="varkguideintro"> Different colors correspond to different learning styles.</div>
                    <div class="varkguideelement"><div class="foo red"></div> = Visual</div>
                    <div class="varkguideelement"><div class="foo blue"></div> = Auditory</div>
                    <div class="varkguideelement"><div class="foo green"></div> = Reading</div>
                    <div class="varkguideelement"><div class="foo purple"></div> = Kinesthetic</div>
                </div> */}

                <div class="courseheader">
                    {welcomeMsg}
                </div>

                <div class="modulelist">
                    {this.props.modules.map(module =>
                        <ModuleItem
                            name={module.title}
                            contents={module.contents}
                            vark={module.vark}
                            active=""
                            username={this.props.username}
                        />)}
                </div>
            </div>
        )
    }
}

class NameForm extends React.Component {
    constructor(props) {
        super(props);
        this.state = {value: ''};
        this.handleChange = this.handleChange.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
    }

    handleChange(event) {    this.setState({value: event.target.value});  }

    handleSubmit(event) { //plugs into the backend to add the course, and passes the function on up for the main container to do the re-rendering
        let shouldAddCourse = true;
        //TODO: 
        //  - GET A LIST OF THE COURSES THE USER (THIS.PROPS.USERNAME) IS CURRENTLY ENROLLED
        //  - IF THAT LIST ALREADY INCLUDES THE COURSENAME (THIS.STATE.VALUE), SET SHOULDADDCOURSE TO FALSE
        //  - OTHERWISE, ADD THE COURSENAME TO THE LIST OF COURSES THEY ARE ENROLLED IN
        const usr = JSON.parse(localStorage.getItem('authUser'));
        if (usr.courses.includes(this.state.value)) {
            this.state.value = false;
        }
        if (shouldAddCourse) {
            this.props.addCourse(this.state.value);
        }
        event.preventDefault();
    }

    render() {
        return (
            <form onSubmit={this.handleSubmit}>
                <label>
                    Enter the course code below<br /><br />
                    <input type="text" value={this.state.value} onChange={this.handleChange} /></label>
                <br /><br />
                <input type="submit" value="Submit" />
            </form>
        );
    }
}

function AddCoursePanel(props) {
    return (
        <div class="mainpanel">
            <div class="addcourseview">
                <div class="addcoursetitle">
                    <b>Add a course</b>
                </div>
                <NameForm username={props.username} courses={props.courses} addCourse={props.addCourse}/>
            </div>
        </div>
    );
}

class Container extends React.Component { //the main container for everything on the screen, that also stores most global data in its state
    constructor(props) {
        super(props);

        //bind the state setting functions to the current class
        this.changeActiveCourse = this.changeActiveCourse.bind(this)
        this.addCourseMode = this.addCourseMode.bind(this)

        this.state = {
            arrCourses: props.courses,
            activeCourse: "none", //to be updated with the current open course
            username: props.name,
            mainPanelMode: 0, //0 means modules view (default), 1 means add-course view
        }
    }

    changeActiveCourse(nameOfActiveCourse) {
        this.setState({
            mainPanelMode: 0,
            activeCourse: nameOfActiveCourse,
        }, () => {this.render();});
    }

    addCourseMode() { //switches main panel view to addCourseMode
        this.setState({
            mainPanelMode: 1
        });
        this.render(); //force React to rerender
    }

    addCourse = (nameOfCourse) => { //actually adds the course
        var newCourses = this.state.arrCourses.slice();
        newCourses.push(nameOfCourse);
        this.setState({
            arrCourses: newCourses.slice(),
        }, () => {this.changeActiveCourse(nameOfCourse);});
    }


    getModules(name) {
        //TODO: BASED ON USERNAME (THIS.STATE.USERNAME) AND CURRENTLY OPEN COURSE (THIS.STATE.ACTIVECOURSE), PULL THE MODULES FROM DATABASE HERE AND RETURN IT AS AN ARRAY OF JAVASCRIPT OBJECTS. 
        //YOU CAN SEE THE DUMMY EXAMPLES BELOW, BUT PLEASE REPLACE THIS SHIT
        const allCourses = JSON.parse(localStorage.getItem('courses')); // here is a parsed json of the course list

        for (let i = 0, len = allCourses.length; i < len; ++i) {
            var course = allCourses[i];
            // add if statement here to determine if current course and one in list matches up
            return [ {
                title: course.CourseName,
                contents: ['w'], //yeet
                vark: ['w'],

            }];
        }




    }

    render() {
        var mainpanel;
        if (this.state.mainPanelMode===0) {
            mainpanel = <MainPanel username={this.state.username} activeCourse={this.state.activeCourse} modules={this.getModules(this.state.activeCourse)}/>
        } else if (this.state.mainPanelMode===1) {
            mainpanel = <AddCoursePanel username={this.state.username} currentCourses={this.state.arrCourses} addCourse={this.addCourse}/>
        }
        return (
            <div className="App">
                <div class="container">
                    <div class="left-element">
                        <Sidebar
                            username={this.state.username}
                            activeCourse={this.state.activeCourse}
                            arrCourses={this.state.arrCourses}
                            changeActiveCourse={this.changeActiveCourse}
                            addCourseMode={this.addCourseMode}
                        />
                    </div>
                    <div class="right-element">
                        {mainpanel}
                    </div>
                </div>
            </div>
        );
    }
}

class Home extends React.Component {
    constructor(props) {
        super(props);
        const usr = JSON.parse(localStorage.getItem('authUser'));
        this.state = {
            username: "",
            email: "",
            courses: [],
        }

    }
    componentDidMount() {
        const usr = JSON.parse(localStorage.getItem('authUser'));
        this.props.firebase.courses().on('value', snapshot => {
            const coursesObject = snapshot.val();
            const coursesList = Object.keys(coursesObject).map(key => ({
                ...coursesObject[key],
                appID: key,
            }));
            localStorage.setItem('courses', JSON.stringify(coursesList));
            this.setState({
                username: usr.username,
                email: usr.email,
                courses: usr.courses,
                courseList: coursesList,

            });
        });

    }

    render() {

        return ( //when login is implemented, it should create an app with the appropriate username passed in
            <Container name={this.state.username} courses={this.state.courses}/>
        );
    }
}


const condition = authUser => !!authUser;

export default withAuthorization(condition)(Home);