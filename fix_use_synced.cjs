const fs = require('fs');
let code = fs.readFileSync('src/hooks/useSyncedState.ts', 'utf8');
code = code.replace(
  "import { useState, useEffect, useRef } from 'react';",
  "import React, { useState, useEffect, useRef } from 'react';"
);
fs.writeFileSync('src/hooks/useSyncedState.ts', code);
