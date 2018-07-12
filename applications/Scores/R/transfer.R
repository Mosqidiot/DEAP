
library("rjson");
rawfile <- commandArgs(trailingOnly=TRUE)
d = fromJSON(file = rawfile);
for(varname in names(d)){
for(i in 1:length(d[[varname]])){ 
    if(length(d[[varname]][[i]]) == 0){ 
	d$bmi_calc_example[[i]] = "NA"; 
    }
}
}
newd = as.data.frame(d);
rdsname = paste(strsplit(rawfile,"raw"),"rds",sep = "",collapse = NULL);
saveRDS(newd, file = rdsname);
