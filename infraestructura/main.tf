terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
}

# Configura tu región (asegúrate de que coincida con la que pusiste en 'aws configure')
provider "aws" {
  region = "us-east-1" # Cambia esto si usaste otra, como us-west-2
}