import { useState } from "react";
import { Icon } from "metabase/ui";
export const PlanDisplay = ({ plan, index }) => {
  const [expanded, setExpanded] = useState(index == 0 ? true : false);

  const toggleExpanded = () => {
    setExpanded(!expanded);
  };

    if (!plan) {
      return null;
    }

    return (
      <div style={styles.container}>
          <div style={{
          ...styles.stepContainer,
          padding: expanded ? '20px' : '10px',
        }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <p><strong>Step {index + 1}: {plan.stepName}</strong></p>
              <Icon style={{ cursor: 'pointer'}} onClick={toggleExpanded} name={expanded ? "chevronup" : "chevrondown"} size={14} />
            </div>
            {expanded ? (
              <div style={{ paddingLeft: '20px' }}>
                <p><strong>Title</strong><br /> {plan.stepName}</p>
                <p><strong>Description</strong><br /> {plan.description}</p>
                <p><strong>Expected Insight</strong><br /> {plan.expectedInsight}</p>
                
                <div style={styles.section}>
                  <h4>Data Requirements</h4>
                  <ul>
                    {plan.dataRequirements && plan.dataRequirements.map((data, idx) => (
                      <li key={idx}>{data}</li>
                    ))}
                  </ul>
                </div>
      
                <div style={styles.section}>
                  <h4>Transformations</h4>
                  <ul>
                    {plan.transformations && plan.transformations.map((transformation, idx) => (
                      <li key={idx}>{transformation}</li>
                    ))}
                  </ul>
                </div>
      
                <p><strong>Visualization:</strong> {plan.visualization}</p>
              </div>
            ): (
              <div></div>
            )}
          </div>
      </div>
    );
  };
  
  const styles = {
    container: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
    },
    stepContainer: {
      border: '1px solid #E0E4E9',
      marginBottom: '10px',
      borderRadius: '8px',
      backgroundColor: '#fff',
      maxWidth: '1300px',
      width: '100%',
    },
    stepName: {
      marginBottom: '15px',
      fontSize: '18px',
    },
    section: {
      marginBottom: '10px',
    },
  };
  