import React, { useState } from 'react';
import {
  Row, Form, Button, Alert,
} from 'react-bootstrap';
import { ensureURI, ensureString, ensureValidDatetime } from '@docknetwork/sdk/utils/type-helpers';
import getKeyDoc from '@docknetwork/sdk/utils/vc/helpers';
import { DockResolver } from '@docknetwork/sdk/resolver';
import { createKeyDetail, createNewDockDID } from '@docknetwork/sdk/utils/did';
import VerifiableCredential from '@docknetwork/sdk/verifiable-credential';
import ObjectInput from './ObjectInput';
import ListInput from './ListInput';
import MyDockApi from '../MyDockApi';
import SimpleInput from './SimpleInput';

function CredentialsForm() {
  const [id, setId] = useState({
    error: '',
    value: '',
  });
  const [context, setContext] = useState([{
    error: '',
    value: '',
  }]);
  const [types, setTypes] = useState([{
    error: '',
    value: '',
  }]);
  const [subject, setSubject] = useState([{
    error: '',
    key: '',
    value: '',
  }]);
  const [status, setStatus] = useState([{
    error: '',
    key: '',
    value: '',
  }]);
  const [issuanceDate, setIssuanceDate] = useState({
    error: '',
    value: '',
  });
  const [expirationDate, setExpirationDate] = useState({
    error: '',
    value: '',
  });
  const [output, setOutput] = useState('Output...');
  const [buttonsLocked, setButtonsLocked] = useState(false);
  const [formError, setFormError] = useState('');

  const onIdChange = function (event) {
    setId({
      error: '',
      value: event.target.value,
    });
  };

  const onSeed = function () {
    setId({
      error: '',
      value: 'uuid:0x9b561796d3450eb2673fed26dd9c07192390177ad93e0835bc7a5fbb705d52bc',
    });
    setContext([
      {
        error: '',
        value: 'https://www.w3.org/2018/credentials/v1',
      },
      {
        error: '',
        value: 'https://www.w3.org/2018/credentials/examples/v1',
      },
    ]);
    setTypes([
      {
        error: '',
        value: 'VerifiableCredential',
      },
      {
        error: '',
        value: 'AlumniCredential',
      },
    ]);
    setStatus([
      {
        error: '',
        key: 'id',
        value: 'rev-reg:dock:0x0194...',
      },
      {
        error: '',
        key: 'type',
        value: 'CredentialStatusList2017',
      },
    ]);
    setSubject([{
      error: '',
      key: 'id',
      value: 'did:dock:5GL3xbkr3vfs4qJ94YUHwpVVsPSSAyvJcafHz1wNb5zrSPGi',
    }, {
      error: '',
      key: 'alumniOf',
      value: 'Example University',
    }]);
    setIssuanceDate({
      error: '',
      value: '2020-07-16T12:54',
    });
    setExpirationDate({
      error: '',
      value: '2020-07-16T12:55',
    });
  };

  const validate = function () {
    let ok = true;

    // ID (as URI)
    try {
      ensureURI(id.value);
      setId({
        error: '',
        value: id.value,
      });
    } catch (e) {
      setId({
        error: e.toString(),
        value: id.value,
      });
      ok = false;
    }

    // Credentials (as URI)
    const newCredentials = [...context];
    for (let i = 0; i < context.length; i++) {
      let error;

      if (context[i].value.length === 0) {
        newCredentials[i].error = 'missing value';
        ok = false;
        continue;
      }

      try {
        ensureURI(context[i].value);
        error = '';
      } catch (e) {
        error = e.toString();
        ok = false;
      }
      newCredentials[i].error = error;
    }
    setContext(newCredentials);

    // Types (as non-empty String)
    const newTypes = [...types];
    for (let i = 0; i < types.length; i++) {
      let error;

      if (types[i].value.length === 0) {
        newTypes[i].error = 'missing value';
        ok = false;
        continue;
      }

      try {
        ensureString(types[i].value);
        error = '';
      } catch (e) {
        error = e.toString();
        ok = false;
      }
      newTypes[i].error = error;
    }
    setTypes(newTypes);

    // Status (as non-empty String)
    const newStatus = [...status];
    for (let i = 0; i < status.length; i++) {
      let error;

      if (status[i].key.length === 0) {
        newStatus[i].error = 'missing key';
        ok = false;
        continue;
      }

      if (status[i].value.length === 0) {
        newStatus[i].error = 'missing value';
        ok = false;
        continue;
      }

      try {
        ensureString(status[i].key);
        ensureString(status[i].value);
        error = '';
      } catch (e) {
        error = e.toString();
        ok = false;
      }
      newStatus[i].error = error;
    }
    setSubject(newStatus);

    // Subject (as non-empty String)
    const newSubject = [...subject];
    for (let i = 0; i < subject.length; i++) {
      let error;

      if (subject[i].key.length === 0) {
        newSubject[i].error = 'missing key';
        ok = false;
        continue;
      }

      if (subject[i].value.length === 0) {
        newSubject[i].error = 'missing value';
        ok = false;
        continue;
      }

      try {
        ensureString(subject[i].key);
        ensureString(subject[i].value);
        error = '';
      } catch (e) {
        error = e.toString();
        ok = false;
      }
      newSubject[i].error = error;
    }
    setSubject(newSubject);

    // Issuance date
    const issuanceObject = new Date(issuanceDate.value);
    try {
      ensureValidDatetime(issuanceObject.toISOString());

      setIssuanceDate({
        error: '',
        value: issuanceDate.value,
      });
    } catch (e) {
      setIssuanceDate({
        error: e.toString(),
        value: issuanceDate.value,
      });
      ok = false;
    }

    // Expiration date
    const expirationObject = new Date(expirationDate.value);
    try {
      ensureValidDatetime(expirationObject.toISOString());

      setExpirationDate({
        error: '',
        value: expirationDate.value,
      });
    } catch (e) {
      setExpirationDate({
        error: e.toString(),
        value: expirationDate.value,
      });
      ok = false;
    }

    return ok;
  };

  const onSubmit = async function (event) {
    event.preventDefault();
    event.stopPropagation();
    setOutput('Validating...');

    if (!validate()) {
      setOutput('Validation error...');
      return;
    }

    setButtonsLocked(true);

    setOutput('Setting up Dock connection...');
    const dock = await MyDockApi.getDock();

    // Create did
    const did = createNewDockDID();
    const keyDetail = createKeyDetail(MyDockApi.getIssuerPublicKey(), did);
    const keyDoc = getKeyDoc(did, MyDockApi.getIssuerPair(), 'Sr25519VerificationKey2020');

    // Init dock
    await dock.did.new(did, keyDetail);

    const vc = new VerifiableCredential(id.value);

    for (let i = 0; i < context.length; i++) {
      vc.addContext(context[i].value);
    }

    for (let i = 0; i < types.length; i++) {
      vc.addType(types[i].value);
    }

    const mySubject = {};
    for (let i = 0; i < subject.length; i++) {
      mySubject[subject[i].key] = subject[i].value;
    }
    vc.addSubject(mySubject);

    vc.setIssuanceDate((new Date(issuanceDate.value)).toISOString());
    vc.setExpirationDate((new Date(expirationDate.value)).toISOString());

    setOutput('Signing...');
    const resolver = new DockResolver(dock);

    try {
      const signedCredential = await vc.sign(keyDoc);

      setOutput('Verifying...');
      const verifyResult = await signedCredential.verify({
        resolver,
        compactProof: true,
        forceRevocationCheck: true,
        revocationApi: { dock },
      });

      setOutput(`Success!!

Proof:
${JSON.stringify(vc.proof, null, 2)}

Signed:
${JSON.stringify(signedCredential, null, 2)}

Verification:
${JSON.stringify(verifyResult, null, 2)}
`);
    } catch (e) {
      setOutput('Submission error...');
      setFormError(e.toString());
    }
    setButtonsLocked(false);
  };

  let formAlert = '';
  if (formError) {
    formAlert = <Alert variant="danger">
      {formError}
    </Alert>;
  }

  return <div className="row">
    <div className="col-sm-6">
      <h1>Create a new credentials </h1>
      <hr/>
      <Form noValidate>
        <Form.Group as={Row} controlId="id">
          <Form.Label column sm={2}>ID</Form.Label>
          <Form.Control
            className="col-sm-10"
            type="string"
            value={id.value}
            isInvalid={id.error.length > 0}
            onChange={onIdChange}
            placeholder="URI"/>
          <Form.Control.Feedback type="invalid">
            {id.error}
          </Form.Control.Feedback>
        </Form.Group>
        <hr/>

        <ListInput {...{
          items: context,
          setItems: setContext,
          name: 'Context',
          placeholder: 'URL',
        }} />
        <hr/>

        <ListInput {...{
          items: types,
          setItems: setTypes,
          name: 'Type',
          placeholder: 'Credential type',
        }} />
        <hr/>

        <ObjectInput {...{
          items: subject,
          setItems: setSubject,
          name: 'Subject',
          placeholder: '',
        }} />
        <hr/>

        <ObjectInput {...{
          items: status,
          setItems: setStatus,
          name: 'Status',
          placeholder: '',
        }} />
        <hr/>

        <SimpleInput {...{
          value: issuanceDate,
          setValue: setIssuanceDate,
          type: 'datetime-local',
          name: 'Issuance Date',
          placeholder: '',
        }} />
        <hr/>

        <SimpleInput {...{
          value: expirationDate,
          setValue: setExpirationDate,
          type: 'datetime-local',
          name: 'Expiration Date',
          placeholder: '',
        }} />
        <hr/>

        <div className="row">
          {formAlert}
        </div>
        <div className="row">
          <Button variant="primary" type="submit" className="col-sm-2 da-right" onClick={onSubmit} disabled={buttonsLocked}>
            Submit
          </Button>
          <div className="col-sm-1"></div>
          <Button variant="success" className="col-sm-2 da-right" onClick={onSeed} disabled={buttonsLocked}>
            Seed
          </Button>
        </div>
      </Form>
    </div>
    <div className="col-sm-6">
      <Form.Control as="textarea" rows="30" disabled value={output} />
    </div>
  </div>;
}

export default CredentialsForm;
