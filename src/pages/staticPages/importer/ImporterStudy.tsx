import * as React from 'react';
import { dateOrNever } from './importerUtil';
import autobind from 'autobind-decorator';
import { observable, action, computed } from 'mobx';
import { observer } from 'mobx-react';
import CBioPortalAPIInternal, { ImportStudy, ImportLog } from '../../../shared/api/generated/CBioPortalAPIInternal';
import internalClient from "../../../shared/api/cbioportalInternalClientInstance";
import {remoteData} from "../../../public-lib/api/remoteData";
import { MobxPromiseUnionType } from 'mobxpromise';
import { Link } from 'react-router';
import { Button } from 'react-bootstrap';

const panelStyle = {
    width: "50%",
    margin: "10px",
    borderRadius: "5px",
    padding: "5px",
    background: "#ededed",
}

export type ImporterStudyProps = {
    routeParams: {
        studyId: string,
    };
}

@observer
export default class ImporterStudy extends React.Component<ImporterStudyProps, {}> {
    @observable
    private importClicked: boolean = true;
    @observable
    private validateClicked: boolean = true;
    @observable
    private importLogs: MobxPromiseUnionType<ImportLog[]>;
    @observable
    private validationLogs: MobxPromiseUnionType<ImportLog[]>;
    @observable
    private study: MobxPromiseUnionType<ImportStudy>;

    public internalClient: CBioPortalAPIInternal;

    constructor(props: ImporterStudyProps) {
        super(props);
        const self = this;

        this.study = remoteData<ImportStudy>({
            await: () => [],
            invoke: async () => {
                return internalClient.getImporterStudyUsingGET({studyId: props.routeParams.studyId});
            },
            onResult: (study: ImportStudy) => {
                self.updateButtonStates(study);
            },
        })

        this.importLogs = remoteData<ImportLog[]>({
            await: () =>  [],
            invoke: async () => {
                return internalClient.getAllLogsForStudyUsingGET({logType: "import", studyId: props.routeParams.studyId});
            } 
        });

        this.validationLogs = remoteData<ImportLog[]>({
            await: () =>  [],
            invoke: async () => {
                return internalClient.getAllLogsForStudyUsingGET({logType: "validation", studyId: props.routeParams.studyId});
            } 
        });

        this.internalClient = internalClient;
    }

    @autobind
    updateButtonStates(study: ImportStudy) {
        console.log("updating states");
        this.importClicked = study.importRunning;
        this.validateClicked = study.validationRunning;
    }

    renderLogs(logs: ImportLog[]): JSX.Element[] {

        return logs.map(log => {
            var rowClass = "pending";
            if (log.passed === "passed") {
                rowClass = "positive";
            }
            if (log.passed === "failed") {
                rowClass = "negative"
            }
            return <tr
                className={rowClass} key={log.id + log.logType + log.studyId}
            >
                <td>
                    {dateOrNever(log.startDate)}
                </td>
                <td>
                    <Link to={`/logs/${log.logType}/${log.studyId}/${log.id}?raw=false`}>
                        <Button>View HTML Report</Button>
                    </Link>
                </td>
                <td>
                    <Link to={`/logs/${log.logType}/${log.studyId}/${log.id}?raw=true`}>
                        <Button>View Raw Log</Button>
                    </Link>
                </td>
                <td>
                    {log.requester}
                </td>
                <td>
                    {log.logType === "import" ? (log.testRun ? "test import " : "auto import ") : "validation "}{log.passed}
                </td>
            </tr>
        })
    }

    @computed
    private get importButtonText() {
        return this.importClicked ? "Running test import..." : "Run Test Import";
    }

    @computed
    private get validationButtonText() {
        return this.validateClicked ? "Running test validation..." : "Run Test Validation";
    }

    @autobind
    @action
    onImportClick() {
        this.importClicked = true;
        this.internalClient.runTrialImportUsingGET({studyId: this.study.result!.studyId})
        setTimeout(() => location.reload(true), 2000);
    }
    
    @autobind
    @action
    onValidationClick() {
        this.validateClicked = true;
        this.internalClient.runTrialValidationUsingGET({studyId: this.study.result!.studyId});
        setTimeout(() => location.reload(true), 2000);
    }

    render() {
        if (this.study.isPending) {
            return <div>Loading...</div>
        }
        if (this.study.isError) {
            return <div>Error loading study</div>
        }
        const study = this.study.result as ImportStudy;
        return <div>
            <h1 style={{textAlign: "center", paddingTop: "20px"}}>
                Import and Validation for Study {study.name}
            </h1>
            <div style={{width: "50%", margin: "0 auto", background: "#ededed", borderRadius: "5px", padding: "5px"}}>
                <b>The following users have permission to view this study: </b>
                <p>
                    {study.users.join(", ")}
                </p>
            </div>
            <div style={{display: "flex", flexDirection: "row"}}>
                <div style={panelStyle}>
                    <p>
                        <b>Last successfully validated: </b>{dateOrNever(study.validationDate)}
                    </p>
                    <p>
                        <button
                            disabled={this.validateClicked}
                            onClick={this.onValidationClick}
                            className="btn btn-primary"
                        >
                            {this.validationButtonText}
                        </button>
                    </p>
                    <p>
                        <b>Validation logs:</b>
                        <table className="ui celled table unstackable">
                            <tr>
                                <th>Start Date</th>
                                <th></th>
                                <th></th>
                                <th>Triggered By</th>
                                <th>Status</th>
                            </tr>
                            {
                                this.validationLogs.isPending ?
                                <tr><td>Loading...</td><td></td></tr> :
                                this.renderLogs(this.validationLogs.result as ImportLog[])
                            }
                        </table>
                    </p>
                </div>
                <div style={panelStyle}>
                    <p>
                        <b>Last successfully imported: </b>{dateOrNever(study.importDate)}
                    </p>
                    <p>
                        <button
                            disabled={this.importClicked}
                            onClick={this.onImportClick}
                            className="btn btn-primary"
                        >
                            {this.importButtonText}
                        </button>
                    </p>
                    <p>
                        <b>Import logs:</b>
                        <table className="ui celled table unstackable">
                            <tr>
                                <th>Start Date</th>
                                <th></th>
                                <th></th>
                                <th>Triggered By</th>
                                <th>Status</th>
                            </tr>
                            {
                                this.importLogs.isPending ?
                                <tr><td>Loading...</td><td></td></tr> :
                                this.renderLogs(this.importLogs.result as ImportLog[])
                            }
                        </table>
                    </p>
                </div>
            </div>
            <Link to='/importer'>
                <button
                    className="btn btn-primary btn-lg"
                    style={{
                        position: "absolute",
                        left: 5,
                        top: 65,
                    }}
                >
                    Back to Dashboard
                </button>
            </Link>
        </div>
    }
}