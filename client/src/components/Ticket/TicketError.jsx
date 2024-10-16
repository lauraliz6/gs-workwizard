import { Button, Container, Alert, AlertTitle } from "@mui/material";
import { toTitleCase } from "../../fn/utils";

export default function TicketError(props) {
  const ErrorTemplate = (props) => {
    return (
      <Container
        maxWidth="100%"
        sx={{ backgroundColor: "#FDEDED", padding: 2 }}
      >
        <Alert
          severity="error"
          action={
            props.action && (
              <Button variant="contained" color="secondary">
                {props.action}
              </Button>
            )
          }
        >
          <AlertTitle>{props.title}</AlertTitle>
          {props.body}
        </Alert>
      </Container>
    );
  };

  return (
    <>
      {props.errors.type === "portfolio" && (
        <ErrorTemplate
          title="Portfolio Does Not Exist"
          body="The portfolio associated with this ticket does not exist. Please check that the portfolio with the name listed under Details > Portfolio Name exists on WorkFront."
        />
      )}
      {props.errors.type === "assignments" && (
        <ErrorTemplate
          title="Missing Assignments"
          body={`Missing assignment for ${toTitleCase(
            props.errors.info.join(", ")
          )}. Contact the appropriate manager for assignment.`}
        />
      )}
      {props.errors.type === "automation" && (
        <ErrorTemplate
          title="Automation Error"
          body={`Error in automation process. Please contact Ops to complete this ticket manually.`}
        />
      )}
      {props.errors.type === "status" && (
        <ErrorTemplate
          title="Status Change Error"
          body={props.errors.info || ""}
        />
      )}
      {props.errors.type === "multiple" && (
        <ErrorTemplate
          title="Multiple Errors Encountered"
          body={"Multiple errors encountered, please contact Ops."}
        />
      )}
      {props.errors.type === "check" && (
        <ErrorTemplate
          title="Automated work is incomplete or incorrect"
          body={
            "Error in automation process. Please contact Ops to review and complete this ticket manually."
          }
        />
      )}
      {props.errors.type === "minor" && (
        <ErrorTemplate
          title="Minor error encountered"
          body={props.errors.info || ""}
        />
      )}
      {props.errors.type === "preview" && (
        <ErrorTemplate
          title="Preview error"
          body={
            "Couldn't find associated templates for tickets. Please review the ticket or reach out to Ops."
          }
        />
      )}
    </>
  );
}
