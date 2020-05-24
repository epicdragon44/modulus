import React from 'react';
import logo from './logowithtext.svg';
import './App.css';
import { withAuthorization } from '../Session';


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

class SessionBar extends React.Component { //provides functions logout and settings
    constructor(props) {
        super(props);

        this.state = {
            user: props.username, //stores the username, can offer up individualized settings from database based on username
        }
    }
    render() { //TODO: need to implement backend for these buttons
        return (
            <div class="sessionbar">
                <button class="logout">
                    Logout
                </button>
                <button class="settings">
                    Settings
                </button>
            </div>
        );
    }
}

class NameBar extends React.Component { //just tells the user welcome back! basically who's currently logged in
    constructor(props) {
        super(props);
        this.state = {
            username: props.username,
        }
    }

    render() {
        let msg = "Welcome back " + this.state.username + "!";
        return (
            <div class="namebar">
                {msg}
            </div>
        );
    }
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
            <div className="sidebar">
                <Logo />
                {/*this part cannot draw null list*/}
                {/*<div class="sidebarheader"><p><b>Your courses:</b></p></div>*/}
                {/*<div class="courselist">*/}
                {/*    {this.props.arrCourses.map(course => <CourseListItem name={course} active={(this.props.activeCourse===course ? "active" : "")} changeActiveCourse={this.changeActiveCourse}/>)}*/}
                {/*    <AddCourseItem addCourseMode={this.addCourseMode}/>*/}
                {/*</div>*/}
                <NameBar username={this.props.username} />
                <SessionBar username={this.props.username} />
            </div>
        );
    }
}

function ModuleContentItem(props) {
    const [openedStatus, open] = React.useState("");
    React.useEffect(() => {
        //TODO: actually open the item

    });

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
                <div class="varkguide">
                    <div class="varkguideintro"> Different colors correspond to different learning styles.</div>
                    <div class="varkguideelement"><div class="foo red"></div> = Visual</div>
                    <div class="varkguideelement"><div class="foo blue"></div> = Auditory</div>
                    <div class="varkguideelement"><div class="foo green"></div> = Reading</div>
                    <div class="varkguideelement"><div class="foo purple"></div> = Kinesthetic</div>
                </div>

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

    handleSubmit(event) {
        this.props.addCourse(this.state.value);
        //TODO: plug into the backend and retrieve the course, assign it to this username's database of enrolled courses so that the function getModules in container works properly. Don't forget to check that the course isnt already added using the courses prop
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
        //TODO: pull this info from backend based on the username and current activeCourse
        //these if functions just placeholder for now

        if (name==="none") {
            return []
        }
        else if (name==="Voyage - Math 2") {
            return [
                {
                    title: "Trig",
                    contents: ["Item 1", "Item 2", "Item 3"],
                    vark: ["V", "A", "R"],
                },
                {
                    title: "Precalculus",
                    contents: ["Item 1", "Item 2"],
                    vark: ["K", "R"]
                },
            ]
        }
        else {
            return [
                {
                    title: "Module 1",
                    contents: ["Item 1", "Item 2", "Item 3"],
                    vark: ["V", "A", "R"],
                },
                {
                    title: "Module 2",
                    contents: ["Item 1", "Item 2"],
                    vark: ["K", "R"]
                },
            ]
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

class Home extends React.Component { //just creates a container lmfao for the point of obeying convention when integrating with index.js
    constructor(props) {
        super(props);
        this.state = {
            username: props.name,
            courses: props.courses,
        }
    }

    render() {
        return ( //when login is implemented, it should create an app with the appropriate username passed in
            <Container name={this.state.username} courses={this.state.courses}/>
        );
    }
}


const condition = authUser => !!authUser;

export default withAuthorization(condition)(Home);