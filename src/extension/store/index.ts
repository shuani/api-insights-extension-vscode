/**
 * Copyright 2022 Cisco Systems, Inc. and its affiliates.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 * SPDX-License-Identifier: Apache-2.0
 */

import { configureStore, createSlice } from '@reduxjs/toolkit';
import { APIServiceSpec, AnalyzersMetaType, APIService } from './interface';

const servicesInitialState: APIService[] | null = [];
const services = createSlice({
  name: 'services',
  initialState: servicesInitialState,
  reducers: {
    setServices(state, action) {
      state = action.payload;
      return state;
    },
  },
});

const { setServices } = services.actions;

const specsAnalyseInitialState: { [key: string]: any } = {};
const specsAnalyse = createSlice({
  name: 'specsAnalyse',
  initialState: specsAnalyseInitialState,
  reducers: {
    update(state, action) {
      state = { ...state, ...action.payload };
      return state;
    },
  },
});

const analyzersMetaInitialState: AnalyzersMetaType[] | null = null;
const analyzersMeta = createSlice<
  AnalyzersMetaType[] | null,
  {
    setAnalyzersMeta:(
      state: AnalyzersMetaType[] | null,
      action: { payload: AnalyzersMetaType[] | null }
    ) => void;
      }
      >({
        name: 'analyzersMeta',
        initialState: analyzersMetaInitialState,
        reducers: {
          setAnalyzersMeta(state, action) {
            state = action.payload;
            return state;
          },
        },
      },
      );

// [serviceId,serviceSpecs][]
type serviceSpecsType = [string, APIServiceSpec[]];
const { setAnalyzersMeta } = analyzersMeta.actions;
const serviceSpecsInitialState: serviceSpecsType[] = [];
const serviceSpecs = createSlice({
  name: 'serviceSpecs',
  initialState: serviceSpecsInitialState,
  reducers: {
    setServiceSpecs(state, action) {
      return action.payload;
    },
    addServiceSpec(
      state,
      action: { type: string; payload: [string, APIServiceSpec[]] },
    ) {
      const { payload } = action;
      const specs = state.filter((_) => _[0] === payload[0])[0];
      if (!specs) {
        return [...state, payload];
      }
      const _specs = [specs[0], [...specs[1], ...payload[1]]] as [
          string,
          APIServiceSpec[]
        ];
      return state.map((_) => {
        if (_[0] === payload[0]) {
          return _specs;
        }
        return _;
      });
    },
    updateServiceSpecs(
      state,
      action: { type: string; payload: [string, APIServiceSpec[]] },
    ) {
      const { payload } = action;
      let update = false;
      const list = state.map((_) => {
        if (_[0] === payload[0]) {
          update = true;
          return payload;
        }
        return _;
      });
      if (!update) {
        list.push(payload);
      }
      return list;
    },
  },
});

const store = configureStore({
  reducer: {
    services: services.reducer,
    analyzersMeta: analyzersMeta.reducer,
    serviceSpecs: serviceSpecs.reducer,
    specsAnalyse: specsAnalyse.reducer,
  },
});
const { dispatch } = store;

export function getStoreServices() {
  return store.getState().services;
}

export function getStoreServiceById(id: string) {
  const list = getStoreServices();
  if (list) {
    const service = list.filter((item) => item.id === id);
    return service[0];
  }
  return null;
}

export function setStoreServices(services: APIService[]) {
  return dispatch(setServices(services));
}

export function getStoreAnalyzersMeta() {
  return store.getState().analyzersMeta;
}

export function setStoreAnalyzersMeta(meta: AnalyzersMetaType[]) {
  return dispatch(setAnalyzersMeta(meta));
}

export function getStoreServiceSpecs() {
  return store.getState().serviceSpecs;
}

export function getStoreSpecsByServiceId(serviceId: string) {
  const allSpecs = getStoreServiceSpecs();
  const specs = allSpecs.filter((_) => _[0] === serviceId)[0];
  if (specs) {
    return specs[1];
  }
  return null;
}

export function getStoreSpecById(specId: string, serviceId: string) {
  const allSpecs = getStoreServiceSpecs();
  const specs = allSpecs.filter((_) => _[0] === serviceId)[0];

  if (!specs) return null;
  const [_serviceId, _specs] = specs;
  if (_specs) {
    const spec = _specs.filter((s) => s.id === specId);
    return spec[0];
  }
  return null;
}

export function setStoreServiceSpecs(data: serviceSpecsType[]) {
  return dispatch(serviceSpecs.actions.setServiceSpecs(data));
}

export function addStoreServiceSpec(
  service_id: string,
  spec: APIServiceSpec[],
) {
  return dispatch(serviceSpecs.actions.addServiceSpec([service_id, spec]));
}

export function updateStoreServiceSpec(
  service_id: string,
  spec: APIServiceSpec[],
) {
  return dispatch(serviceSpecs.actions.updateServiceSpecs([service_id, spec]));
}

export function updateStoreSpecsAnalyse(data: { [key: string]: any }) {
  return dispatch(specsAnalyse.actions.update(data));
}

export function getStoreSpecsAnalyse(key: string) {
  const data = store.getState().specsAnalyse;
  return data[key];
}
