import React from 'react';
import { Form, Row } from 'react-bootstrap';

export default function SimpleInput(props) {
  const {
    value, setValue, name, placeholder, type,
  } = props;

  const updateValue = (event) => {
    setValue({ value: event.target.value, error: '' });
  };

  return (
    <Form.Group as={Row}>
      <Form.Label column sm={2}>{name}</Form.Label>
      <Form.Control
        className="col-sm-10"
        type={type}
        value={value.value}
        isInvalid={value.error.length > 0}
        onChange={updateValue}
        placeholder={placeholder}
      />
      <Form.Control.Feedback type="invalid">
        {value.error}
      </Form.Control.Feedback>
    </Form.Group>
  );
}
