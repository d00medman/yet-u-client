import React from 'react';
import axios from 'axios';
import SingleClassScheduleComponent from './singleClassSchedule.js'
import CreateCourseComponent from './createCourse.js'

class CourseCalendarComponent extends React.Component {

    constructor(props) {
        super(props)

        this.state = {
            classSchedule: [],
            primaryDisplay: 'list',
            currentCourseName: '',
            currentCourseId: 0,
            currentCourseDurationMinutes: 0
        }

        this.getCourseCatalog = this.getCourseCatalog.bind(this)
        this.toLanding = this.toLanding.bind(this)
        this.getClassTimes = this.getClassTimes.bind(this)
        this.successfulCourseCreate = this.successfulCourseCreate.bind(this)
        this.removeCourse = this.removeCourse.bind(this)
        
    }

    componentDidMount() {
        this.getCourseCatalog()
    }

    toCreate() {
        this.setState({
            
            primaryDisplay: 'createCourse',
            currentCourseName: '',
            currentCourseId: 0
        },  () => {
            console.log('state in set state in createCourse')
            console.log(this.state);
        });
    }

    successfulCourseCreate(updatedSchedule) {
        // const schedule = this.state.classSchedule.push()
        this.setState({
            classSchedule: updatedSchedule,
            primaryDisplay: 'list',
            currentCourseName: '',
            currentCourseId: 0
        },  () => {
            console.log('state in set state in toLanding')
            console.log(this.state);
        });
    }

    toLanding() {
        this.setState({
            primaryDisplay: 'list',
            currentCourseName: '',
            currentCourseId: 0
        },  () => {
            console.log('state in set state in toLanding')
            console.log(this.state);
        });
    }

    getClassTimes(course) {
        this.setState({
            // classSchedule: [],
            primaryDisplay: 'course',
            currentCourseName: course.name,
            currentCourseId: course.id,
            currentCourseDurationMinutes: course.duration_minutes
        },  () => {
            console.log('state in set state in getClassTimes')
            console.log(this.state);
        });
    }

    async getCourseCatalog() {
        console.log('getCourseCatalog')
        try {
            const response = await axios.get(
                `http://localhost:8890/courses`,
            )

            console.log(response)

            this.setState({
                classSchedule: response.data
            },  () => {
                console.log('state in set state in getUsersImageData')
                console.log(this.state);
            });
        } catch(error) {
            console.log('error in getUsersImageData')
            console.log(error)
        }
    }

    async removeCourse(courseId) {
        const { classSchedule } = this.state

        try {
            const response = await axios.delete(
                `http://localhost:8890/courses?course_id=${courseId}`,
            )

            console.log(response)

            if (response.status === 200) {
                const schedule = classSchedule.filter(course => course.id !== courseId);
                // this.props.successfulCourseCreate([...classSchedule, {name: newCourseName, id: response.data.id}])
                this.setState({
                    classSchedule: schedule,
                    errorMessage: '',
                    primaryDisplay: 'list',
                    currentCourseName: '',
                    currentCourseId: 0
                },  () => {
                  console.log('state in removeCourse')
                  console.log(this.state);
                });
            } else {
                this.setState({
                    errorMessage: response.data.msg
                },  () => {
                  console.log('state in removeCourse')
                  console.log(this.state);
                });
            }
        } catch(error) {
            console.log('error in removeCourse')
            console.log(error)
        }
    }

    renderClassList() {
        const { classSchedule } = this.state
        return (
            <div>
                <h1>Yet U course catalog</h1>
                {classSchedule.length < 1 && <h3>No classes currently scheduled</h3>}
                {classSchedule.map((course, index) => {
                     return (
                         <div>
                            <h3>
                                <a onClick={() => this.getClassTimes(course)}>
                                    { course.name }
                                </a>
                            </h3>
                            <button onClick={() => this.removeCourse(course.id)}>Remove Course</button>
                         </div>
                    )
                })}
            </div>
        )
    }

    getPrimaryDisplayComponent() {
        const {primaryDisplay, currentCourseName, currentCourseId, classSchedule, currentCourseDurationMinutes} = this.state
        switch (primaryDisplay) {
            case 'list':
                return this.renderClassList()
            case 'course':
                return <SingleClassScheduleComponent courseId={currentCourseId} courseName={currentCourseName} durationMinutes={currentCourseDurationMinutes}/>
            case 'createCourse':
                return <CreateCourseComponent successfulCourseCreate={this.successfulCourseCreate} classSchedule={classSchedule}/>
        }
    }


    render() {
        const { primaryDisplay } = this.state
        const primaryDisplayComponent = this.getPrimaryDisplayComponent()
        return (
            <div>
                {primaryDisplay === 'list' &&
                    <button onClick={() => this.toCreate()}>
                        Add Course to Catalog
                    </button>
                }
                {primaryDisplay !== 'list' && 
                    <button onClick={() => this.toLanding()}>
                        Back to course list
                    </button>
                }
                {primaryDisplayComponent}
            </div>
        )
    }
}

export default CourseCalendarComponent