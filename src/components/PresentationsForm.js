import React, { useState } from 'react';
import {
  Form, Button, Alert,
} from 'react-bootstrap';
import { randomAsHex } from '@polkadot/util-crypto';
import { ensureURI, ensureString, ensureObject } from '@docknetwork/sdk/utils/type-helpers';
import getKeyDoc from '@docknetwork/sdk/utils/vc/helpers';
import { createKeyDetail, createNewDockDID } from '@docknetwork/sdk/utils/did';
import VerifiablePresentation from '@docknetwork/sdk/verifiable-presentation';
import VerifiableCredential from '@docknetwork/sdk/verifiable-credential';
import { DockResolver } from '@docknetwork/sdk/resolver';
import SimpleInput from './SimpleInput';
import ListInput from './ListInput';
import JsonCredentialsInput from './JsonCredentialsInput';
import MyDockApi from '../MyDockApi';
import VC1 from '../assets/vc1.json';

function PresentationsForm() {
  const [id, setId] = useState({
    error: '',
    value: '',
  });
  const [holder, setHolder] = useState({
    error: '',
    key: '',
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
  const [credentials, setCredentials] = useState([{
    error: '',
    value: '',
  }]);
  const [output, setOutput] = useState('Output...');
  const [buttonsLocked, setButtonsLocked] = useState(false);
  const [formError, setFormError] = useState('');

  const onSeed = function () {
    setId({
      error: '',
      value: 'uuid:0x9b561796d3450eb2673fed26dd9c07192390177ad93e0835bc7a5fbb705d52bc',
    });
    setHolder({
      error: '',
      value: 'https://example.com/credentials/1234567890',
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
    setCredentials([{ value: JSON.stringify(VC1, null, 2), error: '' }]);
  };

  const onAddVC = function () {
    setCredentials([...credentials, { value: JSON.stringify(VC1, null, 2), error: '' }]);
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

    // Holder (as URI)
    try {
      ensureURI(holder.value);
      setHolder({
        error: '',
        value: holder.value,
      });
    } catch (e) {
      setHolder({
        error: e.toString(),
        value: holder.value,
      });
      ok = false;
    }

    // Context (as URI)
    const newContext = [...context];
    for (let i = 0; i < types.length; i++) {
      let error;

      if (context[i].value.length === 0) {
        newContext[i].error = 'missing value';
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
      newContext[i].error = error;
    }
    setContext(newContext);

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

    // Credentials (as JSON)
    const newCredentials = [...credentials];
    for (let i = 0; i < credentials.length; i++) {
      let error;

      if (credentials[i].value.length === 0) {
        newCredentials[i].error = 'missing value';
        ok = false;
        continue;
      }

      try {
        ensureObject(JSON.parse(credentials[i].value));
        error = '';
      } catch (e) {
        error = e.toString();
        ok = false;
      }
      newCredentials[i].error = error;
    }
    setCredentials(newCredentials);

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
    const keyDetail = createKeyDetail(MyDockApi.getHolderPublicKey(), did);
    const keyDoc = getKeyDoc(did, MyDockApi.getHolderPair(), 'Sr25519VerificationKey2020');

    // Init dock
    await dock.did.new(did, keyDetail);

    const vp = new VerifiablePresentation(id.value);

    try {
      vp.setHolder(holder.value);

      for (let i = 0; i < context.length; i++) {
        vp.addContext(context[i].value);
      }

      for (let i = 0; i < types.length; i++) {
        vp.addType(types[i].value);
      }

      for (let i = 0; i < credentials.length; i++) {
        const credentialJSON = JSON.parse(credentials[i].value);
        const credential = VerifiableCredential.fromJSON(credentialJSON);
        vp.addCredential(credential);
      }

      setOutput('Signing...');
      const challenge = randomAsHex();
      const domain = 'example domain';
      const resolver = new DockResolver(dock);
      const signedPresentation = await vp.sign(keyDoc, challenge, domain, resolver);

      const verifyResult = await vp.verify({
        challenge,
        domain,
        resolver,
        compactProof: true,
        forceRevocationCheck: false,
      });

      setOutput(`Success!!

Proof:
${JSON.stringify(vp.proof, null, 2)}

Signed:
${JSON.stringify(signedPresentation, null, 2)}

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
      <h1>Create a new presentation </h1>
      <hr/>
      <Form noValidate>
        <SimpleInput {...{
          value: id,
          setValue: setId,
          type: 'string',
          name: 'ID',
          placeholder: 'URI',
        }} />
        <hr/>

        <SimpleInput {...{
          value: holder,
          setValue: setHolder,
          type: 'string',
          name: 'Holder',
          placeholder: 'URI',
        }} />
        <hr/>

        <ListInput {...{
          items: context,
          setItems: setContext,
          name: 'Context',
          placeholder: 'URI',
        }} />
        <hr/>

        <ListInput {...{
          items: types,
          setItems: setTypes,
          name: 'Type',
          placeholder: 'Credential type',
        }} />
        <hr/>

        <JsonCredentialsInput {...{
          items: credentials,
          setItems: setCredentials,
          name: 'Credentials JSON',
          placeholder: 'Credentials',
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
          <div className="col-sm-1"></div>
          <Button variant="warning" className="col-sm-2 da-right" onClick={onAddVC} disabled={buttonsLocked}>
            Add VC
          </Button>
        </div>
      </Form>
    </div>
    <div className="col-sm-6">
      <Form.Control as="textarea" rows="30" disabled value={output} />
    </div>
  </div>;
}

export default PresentationsForm;
