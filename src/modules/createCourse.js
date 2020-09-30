import React from 'react';
import axios from 'axios';

class CreateCourseComponent extends React.Component {
    constructor(props) {
        super(props)

        this.state = {
            newCourseName: '',
            courseDurationMinutes: 60,
            errorMessage: ''
        }

        this.changeCourseName = this.changeCourseName.bind(this)
        this.changeCourseDuration = this.changeCourseDuration.bind(this)
        this.createCourse = this.createCourse.bind(this)
    }

    changeCourseName(event) {
        this.setState({
            newCourseName: event.target.value,
            errorMessage: ''
        },  () => {
          console.log('state in changeCourseName')
          console.log(this.state);
        });
    }

    changeCourseDuration(event) {
        this.setState({
            courseDurationMinutes: event.target.value,
            errorMessage: ''
        },  () => {
          console.log('state in changeCourseDuration')
          console.log(this.state);
        });
    }

    async createCourse() {
        const { newCourseName, courseDurationMinutes} = this.state
        const { classSchedule } = this.props

        try {
            const response = await axios.post(
                'http://localhost:8890/courses',
                JSON.stringify({course_name: newCourseName, duration: courseDurationMinutes}),
                { 
                    headers: { 
                      'Content-Type': 'application/json',
                    },
                }
            )
            console.log('response in createCourse')
            console.log(response)

            if (response.status === 200) {
                this.props.successfulCourseCreate([...classSchedule, {name: newCourseName, id: response.data.id}])
                this.setState({
                    errorMessage: ''
                },  () => {
                  console.log('state in createCourse')
                  console.log(this.state);
                });
            } else {
                this.setState({
                    errorMessage: response.data.msg
                },  () => {
                  console.log('state in createCourse')
                  console.log(this.state);
                });
            }
        } catch(error) {
            console.log('error in createCourse')
            console.log(error)

            this.setState({
                errorMessage: error.message
            },  () => {
              console.log('state in createCourse')
              console.log(this.state);
            });
        }
    }

    render() {
        const { newCourseName, courseDurationMinutes, errorMessage} = this.state

        return (
            <div>
                <label>
                    New Course Name:
                    <input type="text" value={newCourseName} onChange={this.changeCourseName} />
                </label>
                <label>
                    Course Duration (Minutes):
                    <input type="number" value={courseDurationMinutes} onChange={this.changeCourseDuration} />
                </label>
                <button onClick={() => this.createCourse()}>
                    Create
                </button>
                {errorMessage !== '' && <h4>Error: {errorMessage}</h4>}
            </div>
        )
    }
}

export default CreateCourseComponent