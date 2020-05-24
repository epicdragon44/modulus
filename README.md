# Welcome to Modulus



# ![Modulus Logo][logo]



[logo]: https://raw.githubusercontent.com/Nano1337/modulus/master/src/components/Navigation/moduluslogo.png



This is the code for the Modulus web app, which you can view at http://app.modulusplatform.site/



We have a separate repository for the landing page: http://modulusplatform.site/

You can view that code at https://github.com/epicdragon44/moduluswebsite.



# DOCUMENTATION FOR MAIN SCREEN (generated dynamically from comments)



## Flowchart (may be outdated)

https://app.lucidchart.com/documents/view/12e9a358-6152-4630-9d61-8f33eee10b23/0_0







## codeToName
_Function_
```javascript
function codeToName(classcode) 
```

This function takes Converts the class code passed into the function into the actual English name of the course

**Input: ** classcode
**Output** String




## currentUserIsAdmin
_Function_
```javascript
function currentUserIsAdmin() 
```

Determines whether the current user logged in is an Admin, or Teacher, or a student. Returns true if the former, and false if the latter.

**Input: ** None
**Output** boolean




## isUserBlocked
_Function_
```javascript
function isUserBlocked(username, activeCourse) 
```

Determines whether the user is blocked from the activeCourse

**Input: ** username activeCourse
**Output** boolean




## MainPanel
_Component_
```javascript
class MainPanel extends React.Component 
```

The entire right half of the screen, which can change its display depending on whether we want to show the contents of the course, with all the modules; or the screen that lets us enroll in a course; or the screen that lets us create a course.

**Input: ** firebase username activeCourse modules removeCourse addVarkClicks
**Output** JSXElement
Contains: 
[codeToName](#codeToName)
[codeToName](#codeToName)
[VarkProfile](#VarkProfile)
[VarkProfile](#VarkProfile)
[codeToName](#codeToName)
[Select](#Select)
[Select](#Select)
[VarkProfile](#VarkProfile)
[ModuleItem](#ModuleItem)
[ModuleItem](#ModuleItem)
[AddModuleItem](#AddModuleItem)
[ModuleItem](#ModuleItem)
[ModuleItem](#ModuleItem)
[ModuleItem](#ModuleItem)
[VarkProfile](#VarkProfile)
[VarkProfile](#VarkProfile)




## ModuleItem
_Component_
```javascript
function ModuleItem(props) 
```

Displays an entire module, including all of its content items.

**Input: ** name contents vark internals active username addVarkClicks varkMode teacherMode activeCourse modules firebase showVark
**Output** JSXElement
Contains: 
[ModuleContentItem](#ModuleContentItem)
[RenameModule](#RenameModule)
[DeleteModule](#DeleteModule)
[ModuleContentItem](#ModuleContentItem)




## Container
_Component_
```javascript
class Container extends React.Component 
```

The main container for everything on the screen, that also stores most global data in its state.

**Input: ** name firebase varkClicks courses
**Output** JSXElement
Contains: 
[MainPanel](#MainPanel)
[AddCoursePanel](#AddCoursePanel)
[CreateCoursePanel](#CreateCoursePanel)
[Sidebar](#Sidebar)




## Sidebar
_Component_
```javascript
class Sidebar extends React.Component 
```

The entire left sidebar.

**Input: ** username activeCourse arrCourses changeActiveCourse addCourseMode createCourseMode
**Output** JSXElement
Contains: 
[AddCourseItem](#AddCourseItem)
[CreateCourseItem](#CreateCourseItem)
[CourseListItem](#CourseListItem)




## ModuleContentItem
_Component_
```javascript
class ModuleContentItem extends React.Component 
```

A course item, that, when clicked, displays one of the course contents.

**Input: ** name vark internal addVarkClicks teacherMode moduleTitle activeCourse modules firebase
**Output** JSXElement
Contains: 
[MyModal](#MyModal)
[RenameItem](#RenameItem)
[DeleteItem](#DeleteItem)




## MyModal
_Component_
```javascript
class MyModal extends React.Component 
```

Displays a popup dialog.

**Input: ** itemName firebase text modules activeCourse moduleTitle internal vark onRequestClose teacherMode addItemMode (optional)
**Output** JSXElement
Contains: 
[Select](#Select)
[Select](#Select)




## CourseListItem
_Component_
```javascript
function CourseListItem(props) 
```

This component renders a single course button in the sidebar that, when clicked, changes the main panel to display that course.

**Input: ** name active changeActiveCourse
**Output** JSXElement
Contains: 
[codeToName](#codeToName)




## AddCourseItem
_Component_
```javascript
function AddCourseItem(props) 
```

Displays a single button in the sidebar, that, when clicked, changes the main panel to allow you to enroll in a course

**Input: ** addCourseMode
**Output** JSXElement
Contains: 
[currentUserIsAdmin](#currentUserIsAdmin)




## CreateCourseItem
_Component_
```javascript
function CreateCourseItem(props) 
```

Displays a single button in the sidebar, that, when clicked, changes the main panel to allow you to create a course

**Input: ** createCourseMode
**Output** JSXElement
Contains: 
[currentUserIsAdmin](#currentUserIsAdmin)




## AddModuleContentItemItem
_Component_
```javascript
class AddModuleContentItemItem extends React.Component 
```

A button that allows the user (assumedly a teacher) to add an item to the module.

**Input: ** moduleTitle activeCourse modules firebase
**Output** JSXElement
Contains: 
[MyModal](#MyModal)




## CreateCoursePanel
_Component_
```javascript
function CreateCoursePanel(props) 
```

The mainpanel view that allows you to create a class.

**Input: ** username currentCourses createCourse
**Output** JSXElement
Contains: 
[CreateForm](#CreateForm)




## AddCoursePanel
_Component_
```javascript
function AddCoursePanel(props) 
```

The mainpanel view that allows you to add a class.

**Input: ** username currentCourses addCourse
**Output** JSXElement
Contains: 
[NameForm](#NameForm)




## Home
_Component_
```javascript
class Home extends React.Component 
```

Renders and returns a Container, and initializes it with proper defaults.

**Input: ** firebase
**Output** JSXElement
Contains: 
[Container](#Container)




## RenameModule
_Component_
```javascript
class RenameModule extends React.Component 
```

Inline button that, when clicked, allows the user to rename a module.

**Input: ** internal moduleTitle modules firebase activeCourse
**Output** JSXElement




## DeleteModule
_Component_
```javascript
class DeleteModule extends React.Component 
```

Inline button that, when clicked, allows the user to delete a module.

**Input: ** internal moduleTitle modules firebase activeCourse
**Output** JSXElement




## RenameItem
_Component_
```javascript
class RenameItem extends React.Component 
```

Inline button that, when clicked, allows the user to rename an item.

**Input: ** internal moduleTitle activeCourse modules itemName vark firebase
**Output** JSXElement




## DeleteItem
_Component_
```javascript
class DeleteItem extends React.Component 
```

Inline button that, when clicked, allows the user to delete an item.

**Input: ** internal moduleTitle activeCourse modules itemName vark firebase
**Output** JSXElement




## AddModuleItem
_Component_
```javascript
class AddModuleItem extends React.Component 
```

A button that allows the user (assumedly a teacher) to add a module to the course.

**Input: ** internal activeCourse modules firebase changeActiveCourse
**Output** JSXElement




## VarkProfile
_Component_
```javascript
function VarkProfile(props) 
```

Displays the entire VARK Profile.

**Input: ** Vcnt Acnt Rcnt Kcnt
**Output** JSXElement




## Select
_Component_
```javascript
class Select extends React.PureComponent 
```

Allows the user to filter which VARK-type of items to display.

**Input: ** passState default
**Output** JSXElement




## CreateForm
_Component_
```javascript
class CreateForm extends React.Component 
```

The form that allows you to create a class.

**Input: ** username courses createCourse
**Output** JSXElement




## NameForm
_Component_
```javascript
class NameForm extends React.Component 
```

The form that allows you to enroll in a class.

**Input: ** username courses addCourse
**Output** JSXElement




