import { Timeline, TimelineEvent } from '@mailtop/horizontal-timeline'
import { FaBug, FaRegCalendarCheck, FaRegFileAlt } from 'react-icons/fa'
import { useEffect, useState } from 'react'
import styles from '../styles/TimeLineMui.module.css'

const TimeLineMui = (props) => {
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL;


    console.log("props", props)

    // const timelineEvents = [
    //     <TimelineEvent
    //         icon={FaRegFileAlt}
    //         title="test 1"
    //         subtitle="26/03/2019 09:51"

    //     />,
    //     <TimelineEvent
    //         color='#87a2c7'
    //         icon={FaRegCalendarCheck}
    //         title='titre extended'
    //         subtitle='extend'
    //     // action={{
    //     //     label: 'Ver detalhes...',
    //     //     onClick: () => props.getCurrentCardId(props.sunoProject.id)
    //     // }}
    //     />,
    //     <TimelineEvent
    //         color='#9c2919'
    //         icon={FaBug}
    //         title='test 3'
    //         subtitle='26/03/2019 09:51'
    //     />
    // ]




    return (
        <div className={styles.timeLineMuiClass}>
            <Timeline minEvents={props.timelineEvents.length} variant="simple" placeholder>
                {props.timelineEvents.map((event, index) => (
                    <TimelineEvent key={index} {...event.props} />
                ))}
            </Timeline>
        </div>
    )
}

export default TimeLineMui