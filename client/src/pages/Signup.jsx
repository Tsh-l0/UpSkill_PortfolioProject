var React = require('react');
var axios = require('axios');

var Signup = React.createClass({
  getInitialState: function () {
    return {
      username: '',
      email: '',
      password: '',
      role: 'learner'
    };
  },

  handleChange: function (e) {
    var updatedState = {};
    updatedState[e.target.name] = e.target.value;
    this.setState(updatedState);
  },

  handleSubmit: function (e) {
    e.preventDefault();

    var payload = {
      username: this.state.username,
      email: this.state.email,
      password: this.state.password,
      role: this.state.role
    };

    axios.post('http://localhost:5000/api/auth/signup', payload)
      .then(function (res) {
        console.log(res.data);
      })
      .catch(function (err) {
        console.error(err.response ? err.response.data : err.message);
      });
  },

  render: function () {
    return React.createElement('form', { onSubmit: this.handleSubmit },
      React.createElement('input', {
        type: 'text',
        name: 'username',
        placeholder: 'Username',
        onChange: this.handleChange
      }),
      React.createElement('input', {
        type: 'email',
        name: 'email',
        placeholder: 'Email',
        onChange: this.handleChange
      }),
      React.createElement('input', {
        type: 'password',
        name: 'password',
        placeholder: 'Password',
        onChange: this.handleChange
      }),
      React.createElement('select', { name: 'role', onChange: this.handleChange },
        React.createElement('option', { value: 'learner' }, 'Learner'),
        React.createElement('option', { value: 'mentor' }, 'Mentor')
      ),
      React.createElement('button', { type: 'submit' }, 'Sign Up')
    );
  }
});

module.exports = Signup;

