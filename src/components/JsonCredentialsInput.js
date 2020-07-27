import React from 'react';
import {
  Button, Col, Form, Row,
} from 'react-bootstrap';

export default function PluralStringField(props) {
  const {
    items, setItems, name, placeholder,
  } = props;

  const remove = (id) => {
    const newItems = [...items];
    newItems.splice(id, 1);
    setItems(newItems);
  };

  const add = () => {
    setItems([...items, { value: '', error: '' }]);
  };

  const updateValue = (e, id) => {
    const newItems = [...items];
    newItems[id].value = e.target.value;
    setItems(newItems);
  };

  const list = items.map((c, i) => <Form.Group as={Row} key={i} controlId="context" noValidate>
        <Form.Label column sm={2}>{name} #{i + 1}</Form.Label>
        <Form.Control
          className="col-sm-9"
          as="textarea"
          rows="7"
          isInvalid={c.error.length > 0}
          value={c.value}
          onChange={(e) => updateValue(e, i)}
          placeholder={placeholder}
          />
        <Col sm={1}>
          <Button variant="danger" disabled={items.length === 1} onClick={() => remove(i)}>-</Button>
        </Col>
        <Form.Control.Feedback type="invalid">
              {c.error}
        </Form.Control.Feedback>
      </Form.Group>);

  return (
    <div>
      { list }
      <div className="row">
        <Col sm={11}></Col>
        <Col sm={1}>
          <Button onClick={add}>+</Button>
        </Col>
      </div>
    </div>
  );
}
