import {observer} from "mobx-react";
import * as React from "react";
import {VictoryChart, VictorySelectionContainer, VictoryAxis, VictoryLabel, VictoryScatter} from "victory";
import CBIOPORTAL_VICTORY_THEME from "../../../../shared/theme/cBioPoralTheme";
import {computed, observable} from "mobx";
import autobind from "autobind-decorator";
import {tickFormatNumeral} from "../../../../shared/components/plots/TickUtils";
import {makeMouseEvents} from "../../../../shared/components/plots/PlotUtils";
import _ from "lodash";
import {downsampleByGrouping, GroupedData} from "../../../../shared/components/plots/downsampleByGrouping";
import ScatterPlotTooltip from "../../../../shared/components/plots/ScatterPlotTooltip";
import {DOWNSAMPLE_PIXEL_DISTANCE_THRESHOLD, getGroupedData, MAX_DOT_SIZE} from "./StudyViewScatterPlotUtils";
import {SampleIdentifier} from "../../../../shared/api/generated/CBioPortalAPI";
import LoadingIndicator from "shared/components/loadingIndicator/LoadingIndicator"

export interface IStudyViewScatterPlotData {
    x:number;
    y:number;
    uniqueSampleKey:string;
    studyId:string;
    sampleId:string;
    patientId:string;
}

export interface IStudyViewScatterPlotProps {
    width:number;
    height:number;
    data:IStudyViewScatterPlotData[]
    isSelected:(d:IStudyViewScatterPlotData)=>boolean;
    selectedFill:string;
    unselectedFill:string;
    onSelection:(sampleIdentifiers:SampleIdentifier[])=>void;

    isLoading?:boolean;
    svgRef?:(svg:SVGElement|null)=>void;
    tooltip?:(d:GroupedData<IStudyViewScatterPlotData>)=>JSX.Element;
    axisLabelX?: string;
    axisLabelY?: string;
    title?:string;
}

const NUM_AXIS_TICKS = 8;
const DOMAIN_PADDING = 50;

@observer
export default class StudyViewScatterPlot extends React.Component<IStudyViewScatterPlotProps, {}> {
    @observable tooltipModel:any|null = null;
    @observable pointHovered:boolean = false;
    @observable mouseIsDown:boolean = false;
    public mouseEvents:any = makeMouseEvents(this);

    @observable.ref private container:HTMLDivElement;
    private svg:SVGElement|null;

    @autobind
    private containerRef(container:HTMLDivElement) {
        this.container = container;
    }

    @autobind
    private svgRef(svg:SVGElement|null) {
        this.svg = svg;
        if (this.props.svgRef) {
            this.props.svgRef(this.svg);
        }
    }


    private get title() {
        if (this.props.title) {
            return (
                <VictoryLabel
                    style={{
                        fontWeight:"bold",
                        textAnchor: "middle"
                    }}
                    x={this.props.width/2}
                    y="1.2em"
                    text={this.props.title}
                />
            );
        } else {
            return null;
        }
    }

    @computed get dataDomain() {
        // data extremes
        const max = {x:Number.NEGATIVE_INFINITY, y:Number.NEGATIVE_INFINITY};
        const min = {x:Number.POSITIVE_INFINITY, y:Number.POSITIVE_INFINITY};
        for (const d of this.props.data) {
            max.x = Math.max(d.x, max.x);
            max.y = Math.max(d.y, max.y);
            min.x = Math.min(d.x, min.x);
            min.y = Math.min(d.y, min.y);
        }
        return {
            x: [min.x, max.x],
            y: [min.y, max.y]
        };
    }

    @computed get plotDomain() {
        const dataDomain = this.dataDomain;
        const pixelSpaceToDataSpace = this.pixelSpaceToDataSpace;
        const paddingX = pixelSpaceToDataSpace.x(DOMAIN_PADDING);
        const paddingY = pixelSpaceToDataSpace.y(DOMAIN_PADDING);
        return {
            x:[dataDomain.x[0]-paddingX, dataDomain.x[1]+paddingX],
            y:[dataDomain.y[0]-paddingY, dataDomain.y[1]+paddingY]
        };
    }

    @computed get pixelSpaceToDataSpace() {
        const dataDomain = this.dataDomain;
        const xRange = dataDomain.x[1] - dataDomain.x[0];
        const minX = dataDomain.x[0];
        const yRange = dataDomain.y[1] - dataDomain.y[0];
        const minY = dataDomain.y[0];
        return {
            x: (val:number)=>(val/this.props.width)*xRange + minX,
            y: (val:number)=>(val/this.props.height)*yRange + minY
        };
    }

    @computed get dataSpaceToPixelSpace() {
        const dataDomain = this.dataDomain;
        const xRange = dataDomain.x[1] - dataDomain.x[0];
        const minX = dataDomain.x[0];
        const yRange = dataDomain.y[1] - dataDomain.y[0];
        const minY = dataDomain.y[0];
        return {
            x: (val:number)=>((val-minX)/xRange)*this.props.width,
            y: (val:number)=>((val-minY)/yRange)*this.props.height
        };
    }

    @autobind
    private tickFormat(t:number, index:number, ticks:number[]) {
        return tickFormatNumeral(t, ticks);
    }

    @autobind
    private onMouseDown() {
        this.mouseIsDown = true;
    }

    @autobind
    private onMouseUp() {
        this.mouseIsDown = false;
    }

    @autobind
    private onSelection(points:any) {
        this.props.onSelection(_.flatten(points[0].data.map((p:any)=>p.data.map((d:IStudyViewScatterPlotData)=>({
            sampleId: d.sampleId,
            studyId: d.studyId
        })))) as SampleIdentifier[]);
    }

    @computed get data() {
        return getGroupedData(this.props.data, this.props.isSelected, this.dataSpaceToPixelSpace);
    }

    @autobind
    private fill(d:GroupedData<IStudyViewScatterPlotData>) {
        // we only need to check if first element is selected because selected and unselected points are grouped separately
        return (this.props.isSelected(d.data[0]) ? this.props.selectedFill : this.props.unselectedFill);
    }

    @autobind
    private size(d:GroupedData<IStudyViewScatterPlotData>) {
        const baseSize = 3;
        const increment = 0.5;
        return Math.min(MAX_DOT_SIZE, (baseSize - increment) + increment*d.data.length);
    }

    render() {
        return (
            <div>
                <div
                    style={{width:this.props.width, height:this.props.height, position:"relative"}}
                    ref={this.containerRef}
                    onMouseDown={this.onMouseDown}
                    onMouseUp={this.onMouseUp}
                >
                    <VictoryChart
                        theme={CBIOPORTAL_VICTORY_THEME}
                        containerComponent={
                            <VictorySelectionContainer
                                activateSelectedData={false}
                                onSelection={this.onSelection}
                            />
                        }
                        width={this.props.width}
                        height={this.props.height}
                        standalone={true}
                    >
                        {this.title}
                        <VictoryAxis
                            domain={this.plotDomain.x}
                            orientation="bottom"
                            offsetY={50}
                            crossAxis={false}
                            tickCount={NUM_AXIS_TICKS}
                            tickFormat={this.tickFormat}
                            axisLabelComponent={<VictoryLabel dy={25}/>}
                            label={this.props.axisLabelX}
                        />
                        <VictoryAxis
                            domain={this.plotDomain.y}
                            orientation="left"
                            offsetX={50}
                            crossAxis={false}
                            tickCount={NUM_AXIS_TICKS}
                            tickFormat={this.tickFormat}
                            dependentAxis={true}
                            axisLabelComponent={<VictoryLabel dy={-30}/>}
                            label={this.props.axisLabelY}
                        />
                        <VictoryScatter
                            style={{
                                data: {
                                    fill: this.fill,
                                    stroke: "black",
                                    strokeWidth: 1,
                                    strokeOpacity:0
                                }
                            }}
                            size={this.size}
                            symbol="circle"
                            data={this.data}
                            events={this.mouseEvents}
                        />
                    </VictoryChart>
                    <span
                        style={{
                            position:"absolute",
                            top:0,
                            left:0,
                            width:"100%",
                            height:"100%",
                            backgroundColor:"rgba(255,255,255,0.8)",
                            display:this.props.isLoading ? "block" : "none"
                        }}
                    />
                    <LoadingIndicator
                        isLoading={!!this.props.isLoading}
                        style={{position:"absolute", top:"50%", left:"50%", marginLeft:-10}}
                    />
                </div>
                { this.tooltipModel && this.props.tooltip && !this.mouseIsDown && (
                    <ScatterPlotTooltip
                        container={this.container}
                        targetHovered={this.pointHovered}
                        targetCoords={{x: this.tooltipModel.x, y: this.tooltipModel.y}}
                        overlay={this.props.tooltip(this.tooltipModel.datum)}
                    />
                )}
            </div>
        );
    }
}