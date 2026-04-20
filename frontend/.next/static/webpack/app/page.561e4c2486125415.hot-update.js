"use strict";
/*
 * ATTENTION: An "eval-source-map" devtool has been used.
 * This devtool is neither made for production nor for readable output files.
 * It uses "eval()" calls to create a separate source file with attached SourceMaps in the browser devtools.
 * If you are trying to read the output file, select a different devtool (https://webpack.js.org/configuration/devtool/)
 * or disable the default devtool with "devtool: false".
 * If you are looking for production-ready output files, see mode: "production" (https://webpack.js.org/configuration/mode/).
 */
self["webpackHotUpdate_N_E"]("app/page",{

/***/ "(app-pages-browser)/./src/app/actions.js":
/*!****************************!*\
  !*** ./src/app/actions.js ***!
  \****************************/
/***/ (function(module, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   addHabitAction: function() { return /* binding */ addHabitAction; },
/* harmony export */   clarifyActivityQuery: function() { return /* binding */ clarifyActivityQuery; },
/* harmony export */   clarifyDayQuery: function() { return /* binding */ clarifyDayQuery; },
/* harmony export */   clarifyFoodQuery: function() { return /* binding */ clarifyFoodQuery; },
/* harmony export */   deleteActivityLog: function() { return /* binding */ deleteActivityLog; },
/* harmony export */   deleteFoodLog: function() { return /* binding */ deleteFoodLog; },
/* harmony export */   deleteHabit: function() { return /* binding */ deleteHabit; },
/* harmony export */   generateDailyScore: function() { return /* binding */ generateDailyScore; },
/* harmony export */   getAnalyticsData: function() { return /* binding */ getAnalyticsData; },
/* harmony export */   getDashboardData: function() { return /* binding */ getDashboardData; },
/* harmony export */   logActivityWithAI: function() { return /* binding */ logActivityWithAI; },
/* harmony export */   logFoodWithAI: function() { return /* binding */ logFoodWithAI; },
/* harmony export */   logHabitCompletion: function() { return /* binding */ logHabitCompletion; },
/* harmony export */   regenerateDailyScore: function() { return /* binding */ regenerateDailyScore; },
/* harmony export */   updateUserProfile: function() { return /* binding */ updateUserProfile; }
/* harmony export */ });
/* harmony import */ var next_dist_client_app_call_server__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! next/dist/client/app-call-server */ "(app-pages-browser)/./node_modules/next/dist/client/app-call-server.js");
/* harmony import */ var next_dist_client_app_call_server__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(next_dist_client_app_call_server__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var private_next_rsc_action_proxy__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! private-next-rsc-action-proxy */ "(app-pages-browser)/./node_modules/next/dist/build/webpack/loaders/next-flight-loader/action-proxy.js");
/* harmony import */ var private_next_rsc_action_client_wrapper__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! private-next-rsc-action-client-wrapper */ "(app-pages-browser)/./node_modules/next/dist/build/webpack/loaders/next-flight-loader/action-client-wrapper.js");



function __build_action__(action, args) {
  return (0,next_dist_client_app_call_server__WEBPACK_IMPORTED_MODULE_0__.callServer)(action.$$id, args)
}

/* __next_internal_action_entry_do_not_use__ {"9cb288878fa824cf91b8c6986cad4d3f9966d5ad":"deleteActivityLog","165b577ac72937bdd36e0e2b3d4978b31d862314":"regenerateDailyScore","d1abe1598a8475618541e4e07d5d581c376f0c7f":"getDashboardData","b5331a968753e8328678b153716670742646127f":"clarifyDayQuery","704736d780422754d9feca02f4423c603ad7f3f4":"logHabitCompletion","72f5846835514c9f777280cddfacc5d8cb9f5a79":"updateUserProfile","c95d6d8cc3b764be3ffacd5916328ae128e2fc70":"clarifyFoodQuery","21e52a373d04c5de11300493d49a24c70f00dea1":"deleteHabit","a70ebab9ea4e62f4def236268db0982bf99e98fa":"getAnalyticsData","9c442bdb7b1fbfe517e9264d8b82220714902ae1":"logActivityWithAI","bc2d484fcb469d3ce297dbc7ab9f8c8e0ff4979f":"addHabitAction","a262c92cd2f5d9e6f3d2bd6e05b95d091e09cb2c":"generateDailyScore","81e9163684832aeda25d810942ae5272ad276f94":"logFoodWithAI","12a26d4fd31e87d56b454571c7860c19673094b6":"clarifyActivityQuery","531cb088fa378c5822d49a5b63c0dfb989d56e01":"deleteFoodLog"} */ 

var getDashboardData = (0,private_next_rsc_action_client_wrapper__WEBPACK_IMPORTED_MODULE_2__.createServerReference)("d1abe1598a8475618541e4e07d5d581c376f0c7f");
var clarifyFoodQuery = (0,private_next_rsc_action_client_wrapper__WEBPACK_IMPORTED_MODULE_2__.createServerReference)("c95d6d8cc3b764be3ffacd5916328ae128e2fc70");
var clarifyActivityQuery = (0,private_next_rsc_action_client_wrapper__WEBPACK_IMPORTED_MODULE_2__.createServerReference)("12a26d4fd31e87d56b454571c7860c19673094b6");
var clarifyDayQuery = (0,private_next_rsc_action_client_wrapper__WEBPACK_IMPORTED_MODULE_2__.createServerReference)("b5331a968753e8328678b153716670742646127f");
var logFoodWithAI = (0,private_next_rsc_action_client_wrapper__WEBPACK_IMPORTED_MODULE_2__.createServerReference)("81e9163684832aeda25d810942ae5272ad276f94");
var logActivityWithAI = (0,private_next_rsc_action_client_wrapper__WEBPACK_IMPORTED_MODULE_2__.createServerReference)("9c442bdb7b1fbfe517e9264d8b82220714902ae1");
var addHabitAction = (0,private_next_rsc_action_client_wrapper__WEBPACK_IMPORTED_MODULE_2__.createServerReference)("bc2d484fcb469d3ce297dbc7ab9f8c8e0ff4979f");
var logHabitCompletion = (0,private_next_rsc_action_client_wrapper__WEBPACK_IMPORTED_MODULE_2__.createServerReference)("704736d780422754d9feca02f4423c603ad7f3f4");
var deleteHabit = (0,private_next_rsc_action_client_wrapper__WEBPACK_IMPORTED_MODULE_2__.createServerReference)("21e52a373d04c5de11300493d49a24c70f00dea1");
var getAnalyticsData = (0,private_next_rsc_action_client_wrapper__WEBPACK_IMPORTED_MODULE_2__.createServerReference)("a70ebab9ea4e62f4def236268db0982bf99e98fa");
var regenerateDailyScore = (0,private_next_rsc_action_client_wrapper__WEBPACK_IMPORTED_MODULE_2__.createServerReference)("165b577ac72937bdd36e0e2b3d4978b31d862314");
var generateDailyScore = (0,private_next_rsc_action_client_wrapper__WEBPACK_IMPORTED_MODULE_2__.createServerReference)("a262c92cd2f5d9e6f3d2bd6e05b95d091e09cb2c");
var deleteFoodLog = (0,private_next_rsc_action_client_wrapper__WEBPACK_IMPORTED_MODULE_2__.createServerReference)("531cb088fa378c5822d49a5b63c0dfb989d56e01");
var deleteActivityLog = (0,private_next_rsc_action_client_wrapper__WEBPACK_IMPORTED_MODULE_2__.createServerReference)("9cb288878fa824cf91b8c6986cad4d3f9966d5ad");
var updateUserProfile = (0,private_next_rsc_action_client_wrapper__WEBPACK_IMPORTED_MODULE_2__.createServerReference)("72f5846835514c9f777280cddfacc5d8cb9f5a79");



;
    // Wrapped in an IIFE to avoid polluting the global scope
    ;
    (function () {
        var _a, _b;
        // Legacy CSS implementations will `eval` browser code in a Node.js context
        // to extract CSS. For backwards compatibility, we need to check we're in a
        // browser context before continuing.
        if (typeof self !== 'undefined' &&
            // AMP / No-JS mode does not inject these helpers:
            '$RefreshHelpers$' in self) {
            // @ts-ignore __webpack_module__ is global
            var currentExports = module.exports;
            // @ts-ignore __webpack_module__ is global
            var prevSignature = (_b = (_a = module.hot.data) === null || _a === void 0 ? void 0 : _a.prevSignature) !== null && _b !== void 0 ? _b : null;
            // This cannot happen in MainTemplate because the exports mismatch between
            // templating and execution.
            self.$RefreshHelpers$.registerExportsForReactRefresh(currentExports, module.id);
            // A module can be accepted automatically based on its exports, e.g. when
            // it is a Refresh Boundary.
            if (self.$RefreshHelpers$.isReactRefreshBoundary(currentExports)) {
                // Save the previous exports signature on update so we can compare the boundary
                // signatures. We avoid saving exports themselves since it causes memory leaks (https://github.com/vercel/next.js/pull/53797)
                module.hot.dispose(function (data) {
                    data.prevSignature =
                        self.$RefreshHelpers$.getRefreshBoundarySignature(currentExports);
                });
                // Unconditionally accept an update to this module, we'll check if it's
                // still a Refresh Boundary later.
                // @ts-ignore importMeta is replaced in the loader
                module.hot.accept();
                // This field is set when the previous version of this module was a
                // Refresh Boundary, letting us know we need to check for invalidation or
                // enqueue an update.
                if (prevSignature !== null) {
                    // A boundary can become ineligible if its exports are incompatible
                    // with the previous exports.
                    //
                    // For example, if you add/remove/change exports, we'll want to
                    // re-execute the importing modules, and force those components to
                    // re-render. Similarly, if you convert a class component to a
                    // function, we want to invalidate the boundary.
                    if (self.$RefreshHelpers$.shouldInvalidateReactRefreshBoundary(prevSignature, self.$RefreshHelpers$.getRefreshBoundarySignature(currentExports))) {
                        module.hot.invalidate();
                    }
                    else {
                        self.$RefreshHelpers$.scheduleUpdate();
                    }
                }
            }
            else {
                // Since we just executed the code for the module, it's possible that the
                // new exports made it ineligible for being a boundary.
                // We only care about the case when we were _previously_ a boundary,
                // because we already accepted this update (accidental side effect).
                var isNoLongerABoundary = prevSignature !== null;
                if (isNoLongerABoundary) {
                    module.hot.invalidate();
                }
            }
        }
    })();


/***/ })

});