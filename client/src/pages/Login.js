var React = require("react");
var axios = require("axios");

var Login = React.createClass({
  getInitialState: function () {
    return {
      email: "",
      password: "",
      message: "",
      token: ""
    };
  },

  handleChange: function (e) {
    var stateCopy = Object.assign({}, this.state);
    stateCopy[e.target.name] = e.target.value;
    this.setState(stateCopy);
  },

  handleSubmit: function (e) {
    e.preventDefault();
    var self = this;
    this.setState({ message: "" });

    axios.post("https://skillup-backend-26ea.onrender.com/api/login", {
      email: this.state.email,
      password: this.state.password
    })
    .then(function (response) {
      self.setState({
        message: response.data.msg,
        token: response.data.token
      });
      console.log("Logged in user:", response.data.user);
    })
    .catch(function (err) {
      var msg = (err.response && err.response.data && err.response.data.msg) || "Login failed";
      self.setState({ message: msg });
    });
  },

  render: function () {
    return (
      React.createElement("div", null,
        React.createElement("h2", null, "Login"),
        React.createElement("form", { onSubmit: this.handleSubmit },
          React.createElement("input", {
            type: "email",
            name: "email",
            placeholder: "Email",
            value: this.state.email,
            onChange: this.handleChange,
            required: true
          }),
          React.createElement("input", {
            type: "password",
            name: "password",
            placeholder: "Password",
            value: this.state.password,
            onChange: this.handleChange,
            required: true
          }),
          React.createElement("button", { type: "submit" }, "Log In")
        ),
        this.state.message && React.createElement("p", null, this.state.message),
        this.state.token && React.createElement("p", null, "JWT: " + this.state.token)
      )
    );
  }
});

module.exports = Login;

