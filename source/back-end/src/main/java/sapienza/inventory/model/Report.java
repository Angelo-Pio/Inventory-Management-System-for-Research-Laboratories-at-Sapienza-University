package sapienza.inventory.model;

import lombok.Data;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.core.io.Resource;
import org.springframework.stereotype.Component;

import java.io.File;
import java.util.LinkedList;

@Component
@Data
public class Report {

    private LinkedList<String> usages = new LinkedList<>() ;
    private LinkedList<String> restock = new LinkedList<>();
    private LinkedList<String> damage_requests = new LinkedList<>();


    public Report() {
        this.usages.add("Material Usage\nTimestamp,Material,Quantity,Researcher");
        this.damage_requests.add("Equipment Damaged Requests\nTimestamp,Material,Request Status,Researcher");
        this.restock.add("Restock\nTimestamp,Material,Quantity,Lab Manager");

    }
    public Resource toCSV(
            Integer tot_used,
            Integer tot_added

            ){

        StringBuffer csv = new StringBuffer();
        csv.append(String.join("\n", this.usages));
        csv.append("\nTotal materials used: "+tot_used + "\n");

        String.join("\n", this.restock);
        csv.append(String.join("\n", this.restock));
        csv.append("\nTotal materials restocked: "+tot_added + "\n");


        /*String.join("\n", this.damage_requests);
        csv.append(String.join("\n", this.damage_requests));
        csv.append("\nTotal materials damaged: "+tot_damaged + "\n");
        */


        ByteArrayResource resource = new ByteArrayResource( csv.toString().getBytes());
        return resource;



    }
}
