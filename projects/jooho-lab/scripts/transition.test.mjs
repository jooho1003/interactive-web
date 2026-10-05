import test from 'node:test';
import assert from 'node:assert/strict';
import {slideDuration,exhibitPose,exhibitBays} from '../public/spatial-route.js';

test('artwork movement follows physical distance with bounded duration',()=>{
  const start=exhibitPose(0,exhibitBays);
  assert.ok(Math.abs(slideDuration(start,exhibitPose(1,exhibitBays),1.8,.6,4.8)-1.8)<1e-10);
  assert.ok(Math.abs(slideDuration(start,exhibitPose(2,exhibitBays),1.8,.6,4.8)-3.6)<1e-10);
  assert.equal(slideDuration(start,exhibitPose(6,exhibitBays),1.8,.6,4.8),4.8);
  assert.equal(slideDuration(start,start,1.8,.6,4.8),.6);
  const interrupted={...start,eye:[start.eye[0]+1,start.eye[1],start.eye[2]]};
  assert.ok(slideDuration(interrupted,exhibitPose(1,exhibitBays),1.8,.6,4.8)<1.8);
  assert.ok(Math.abs(slideDuration(exhibitPose(2,exhibitBays),start,1.8,.6,4.8)-3.6)<1e-10);
});
